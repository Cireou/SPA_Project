const sections_url = "http://localhost:3000/sections"

class Section{

    constructor(title, id, topic, data, template = false){
        this.title = title;
        this.id = id;
        this.topic = topic;
        this.data = data;
        this.template = template;
    }

    fetch_Obj(request_type, title, data){
        return reqObj(request_type, {
            section:{
                title: title,
                topic_id: this.topic.id,
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
            Section.load_sidebar(this.topic)
        } else{
            fetch(sections_url + `/${this.id}`,reqObj("DELETE", null, localStorage.getItem("token")))
            .then(resp => {Section.load_sidebar(this.topic)})
        }
    }

    to_html(){
        const contrast = getContrast(this.topic.color);

        const li = ce("li");
        li.id = `${this.topic.title}-section-${this.id}`;
        li.className = `w3-display-container w3-hover-${(contrast == "white") ? "black" : "white"}`;
        li.style.backgroundColor = `${add_opacity(this.topic.color)}`
        li.innerHTML = `<span class = "title">${this.title}</span>
                        <span class = "w3-button w3-transparent w3-display-right">×</span>`;
        li.querySelector(".title").addEventListener("click", () => {
            Section.load_sidebar(this.topic, this)
        })

        li.querySelector(".w3-button").addEventListener("click", () => {
            this.delete_listener()
        })
        return li;
    }

    load_note(){
        const container = Section.create_card_container();

        container.innerHTML = `
            <div id = "full-card" class="w3-card-4">

                <header class="w3-container w3-blue">
                    <div id = "note-title" contentEditable = true> <h2> ${this.title} </h2></div>
                </header>
            
                <div class="w3-container">
                    <div id = "editor-container">
                    </div>
                </div>
            
                <div class="w3-container">
                    <button id = "note-save-btn"> Save Changes! </button>
                </div>
            
            </div>
        `      
        const quill = load_editor();
        quill.setContents(JSON.parse(this.data))  

        qs("#note-save-btn").addEventListener("click", () => {
            const title = qs("#note-title").innerText;
            const content = JSON.stringify(quill.getContents());

            const [reqURL, saveReqObj] = this.getFetchInfo(title, content);
            fetch(reqURL, saveReqObj)
            .then(resp => resp.json())
            .then(new_data => {
                this.template = false;
                this.id = new_data.id;
                this.data = JSON.parse(new_data.notes);
                this.title = new_data.title;
                Section.load_sidebar(this.topic, this)
                qs(".create-btn").style.display = "block"
            })
        })  
    }

    static create_card_container() {
        const child = block_1.children[1];
        if (child){block_1.removeChild(child)}

        const container = ce("div");
        container.id = "cards-container"
        container.style = "margin-left:200px";
        container.className = "w3-padding-large"

        block_1.append(container); 
        return container;
    }
    static home_listener(){
        Section.redirect(Home.load)
    }
    static create_listener(topic){
        const new_section = new Section("New Section", 9999, topic, "{}", true);
        qs("#section-list").append(new_section.to_html());
        new_section.load_note();
        qs(".create-btn").style.display = "none";
    }

    static load_sidebar(topic, target_section = null){
        const opacity_color = add_opacity(topic.color);
        const sidebar= qs("#sidebar");

        sidebar.innerText = "";
        const child = block_1.children[1];
        if (child){block_1.removeChild(child)}

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
        qs(".create-btn").onclick = () => {this.create_listener(topic)}

        fetch(topics_url + `/${topic.id}`, reqObj("GET", null, localStorage.getItem("token")))
        .then(resp => resp.json())
        .then(req_topic => {
            const ul = qs("#section-list");
            for (const section of req_topic.sections){
                let new_section = new Section(section.title, section.id, topic, section.notes);
                (!target_section && section == req_topic.sections[0]) ? target_section = new_section : false;
                ul.append(new_section.to_html());
                if (section.id == target_section.id){
                    const section_HTML = qs(`#${topic.title}-section-${section.id}`);
                    section_HTML.style.backgroundColor = invert(topic.color);
                    section_HTML.style.color = getContrast(invert(topic.color));
                    target_section.load_note()
                }
            }   
            if (req_topic.sections.length == 0){
                const container = this.create_card_container();
                container.innerHTML = `<div class="w3-container" style=" padding-top: 5%; width: 100%; max-height: 50%; text-align: center">
                                            <div class="w3-container">
                                            <h2 style = "color: red; font-size: 40px; text-align: center;"><b>No Sections Yet!</b></h2>
                                            </div>
                                            <img src="./frown.png" alt="Notebook" style="max-width: 26%; width: 100%; max-height: 28%; text-align: center;">
                                            <div class="w3-container">
                                            <h2 style = "font-size: 30px; text-align: center;"><b>Create a new section by clicking "New Section"!</b></h2>
                                            </div>
                                        </div>`
            }       
        })}

    static load(topic){
        UserMenu.create(Section)
        Section.load_sidebar(topic);
        (qs("#cards-container")) ? load_empty_container(): false;
        qs("#home-btn").addEventListener("click", Section.home_listener)
    }

    static hide(){
        qs("#sidebar").className = "w3-sidebar w3-bar-block w3-blue";
        const sidebar = qs("#sidebar")
        sidebar.removeChild(sidebar.children[0]);
        sidebar.style.display = "none";
        qs("#user-btn").remove()
        qs("#cards-container").innerText = "";
        clear_Listener("submit", EditForm.listener)
        $("#home-btn").off()
    }

    static redirect(redirect_fn){
        this.hide();
        redirect_fn();
    }
}