const sections_url = "http://localhost:3000/sections"


class SectionsPage{
    static current_section = () =>{ 
        const section_map = JSON.parse(localStorage.getItem("cur_section"))
        return (section_map) ? new Section(section_map) : null;
    };
    static topic = () => JSON.parse(localStorage.getItem('topic'));

    static no_section_HTML = 
        `<div class="w3-container" style=" padding-top: 5%; width: 100%; max-height: 50%; text-align: center">
            <div class="w3-container">
            <h2 style = "color: red; font-size: 40px; text-align: center;"><b>No Sections Yet!</b></h2>
            </div>
            <img src="./Images/frown.png" alt="Notebook" style="max-width: 26%; width: 100%; max-height: 28%; text-align: center;">
            <div class="w3-container">
            <h2 style = "font-size: 30px; text-align: center;"><b>Create a new section by clicking "New Section"!</b></h2>
            </div>
        </div>`
    
    static create_listener(){
        this.current_section().hide()
        const new_section = new Section({title: "New Section", id: 9999, notes: "{}", template: true});
        qs("#section-list").append(new_section.to_html());
        new_section.load()
        qs(".create-btn").style.display = "none";
    }

    static async load_sections(){
        const topic = this.topic();
        let resp = await fetch(topics_url + `/${topic.id}`, reqObj("GET", null, getToken()))
        let req_topic = await resp.json()
        const ul = qs("#section-list");
        const sections = req_topic.sections;
        for (const section_index in sections){
            let section_map = sections[section_index]
            let new_section = new Section(section_map);
            if (section_index == 0){ localStorage.setItem("cur_section", JSON.stringify(new_section))}
            ul.append(new_section.to_html());
        }

        if (sections.length == 0){ AUTH_CONTAINER.innerHTML = this.no_section_HTML;} 
    }

    static async load_sidebar(){
        const topic = this.topic();
        const opacity_color = add_opacity(topic.color);

        SIDEBAR.innerText = "";
        // MenuItem.hide();

        sidebar.className = "w3-sidebar w3-bar-block"
        sidebar.style = `display: block; background-color: ${opacity_color}`;
        sidebar.innerHTML = ""
        sidebar.innerHTML += `<div style = "color: ${getContrast(topic.color)}">
                                <a href="#" class="w3-bar-item w3-button" style = "background-color:${topic.color};">
                                    <div class="w3-container w3-center ">
                                        <h3 id = "topic-title"></h3>
                                    </div>
                                </a>
                                <div class= "section-list-container">
                                    <ul id = "section-list" class="w3-ul w3-card-4 w3-hoverable">
                                    </ul>
                                </div>
                                <button class="create-btn w3-button w3-xlarge w3-black w3-round-large">+ New Section</button>
                            </div>`
        qs("#topic-title").innerText = topic.title;
        qs(".create-btn").onclick = () => this.create_listener(topic)
        await this.load_sections();
    }

    static async load(){
        //1. Load the sidebar
        await SectionsPage.load_sidebar();     
        
        //2. Open the note container
        if (SectionsPage.current_section()){
            SectionsPage.current_section().load();
        }
    }

    static hide(){
        SIDEBAR.className = "w3-sidebar w3-bar-block w3-blue";

        //1. Hide the Sidebar
        MenuItem.hide();

        //2. Clear out inner contents (Notes)
        AUTH_CONTAINER.innerText = ""

        //3. Clear out local storage
        localStorage.removeItem("topic")
        clear_Listener("submit", EditForm.listener)
    }

    static redirect(redirect_fn){
        this.hide();
        redirect_fn();
    }
}


class Section{
    static topic = () => SectionsPage.topic();
    static base = () => {
        return {
            bg_color : `${add_opacity(this.topic().color)}`,
            hover_color :`${(getContrast(this.topic().color) == "white") ? "black": "white"}`
        }
    }
    static selected = () => {
        return {
            bg_color : `${invert(this.topic().color)}`,
            text_color: `${getContrast(invert(this.topic().color))}`
        }
    }

    constructor(map){
        this.title = map.title;
        this.id = map.id;
        this.notes = map.notes;
        this.template = map.template;
    }

    fetch_Obj(request_type, title, data){
        return reqObj(request_type, {
            section:{
                title: title,
                topic_id: Section.topic().id,
                notes: data
            }
        }, getToken())
    }

    getFetchInfo(title, data){
        return (this.template) ? 
            [sections_url, this.fetch_Obj("POST", title, data)] : 
            [sections_url + `/${this.id}`, this.fetch_Obj("PATCH", title, data)];
    }

    delete_listener(){
        if (this.template){
            SectionsPage.load()
        } else{
            fetch(sections_url + `/${this.id}`,reqObj("DELETE", null, localStorage.getItem("token")))
            .then(resp => {SectionsPage.load_sidebar()})
        }
    }

    to_html(){
        const topic = SectionsPage.topic();
        const contrast = getContrast(topic.color);

        const li = ce("li");
        li.id = `${Section.topic().title}-section-${this.id}`;
        li.className = `w3-display-container w3-hover-${Section.base().hover_color}`;
        li.style.backgroundColor = Section.base().bg_color;
        li.innerHTML = `<span class = "title">${this.title}</span>
                        <span class = "w3-button w3-transparent w3-display-right">×</span>`;
        li.querySelector(".title").addEventListener("click", () => {
            SectionsPage.current_section().hide();
            this.load();
        })

        li.querySelector(".w3-button").addEventListener("click", () => {
            this.delete_listener()
        })
        return li;
    }

    load_note(){
        AUTH_CONTAINER.innerHTML = `
            <div id = "full-card">
                <header class="w3-container w3-blue">
                    <div id = "note-title" contentEditable = true> <h2> ${this.title} </h2>
                    </div>
                </header>
                <i id = "note-save-btn" class="fa fa-floppy-o"></i>
                <div class="w3-container" style = "height:100%;">
                    <div id = "editor-container">
                    </div>
                </div>
            </div>
        `      
        const quill = load_editor();
        quill.setContents(JSON.parse(this.notes))  

        qs("#note-save-btn").addEventListener("click", () => {
            const title = qs("#note-title").innerText;
            const content = JSON.stringify(quill.getContents());
            const [reqURL, saveReqObj] = this.getFetchInfo(title, content);

            fetch(reqURL, saveReqObj)
            .then(resp => resp.json())
            .then(new_data => {
                
                this.id = new_data.id;
                this.title = new_data.title;
                this.data = new_data.notes

                localStorage.setItem("cur_section", JSON.stringify(this))
                SectionsPage.load();

            })
        })  
    }

    load(){
        const topic = Section.topic();
        const section_HTML = qs(`#${topic.title}-section-${this.id}`);
        if (!section_HTML){ return}
        if (!this.template){localStorage.setItem("cur_section", JSON.stringify(this));}
        section_HTML.style.backgroundColor = Section.selected().bg_color;
        section_HTML.style.color = Section.selected().text_color;
        this.load_note()
    }

    hide(){
        const topic = Section.topic();
        const section_HTML = qs(`#${topic.title}-section-${this.id}`);
        if (section_HTML){
            section_HTML.style.backgroundColor = Section.base().bg_color;
            section_HTML.style.color = getContrast(Section.base().bg_color);
        }
    }
}