const sections_url = "http://localhost:3000/sections"

class Section{

    constructor(title, id, topic){
        this.title = title;
        this.id = id;
        this.topic = topic;
    }

    delete_listener(){
        fetch(sections_url + `/${this.id}`,reqObj("DELETE", null, localStorage.getItem("token")))
        .then(resp => {Section.load_sidebar(this.topic)})
    }

    edit_listener(){

    }

    to_html(){
        const contrast = getContrast(this.topic.color);

        const li = ce("li");
        li.id = `${this.topic.title}-section-${this.id}`;
        li.className = `w3-display-container w3-hover-${(contrast == "white") ? "black" : "white"}`;
        li.style.backgroundColor = `${add_opacity(this.topic.color)}`
        li.innerHTML = `<span class = "title">${this.title}</span>
                        <span class = "w3-button w3-transparent w3-display-right">×</span>`;
        debugger
        li.querySelector(".title").addEventListener("click", () => {
            Section.load_sidebar(this.topic, this)
        })

        li.querySelector(".w3-button").addEventListener("click", () => {
            this.delete_listener()
        })
        return li;
    }

    load_note(){
        const block1 = qs("#block-1");
        const container = ce("div");
        container.id = "cards-container"
        container.style = "margin-left:200px";
        container.className = "w3-padding-large"

        container.innerHTML = `
            <div class="w3-card-4">

                <header class="w3-container w3-blue">
                    <h1 contentEditable = true>${this.title}</h1>
                </header>
            
                <div class="w3-container">
                    <div id = "editor-container">
                    </div>
                </div>
            
                <div class="w3-container">
                    <button> Save Changes! </button>
                </div>
            
            </div>
        `
        block1.append(container)           
        load_editor()    
    }

    static create_listener(topic){
        const new_section = new Section("New Section", 9999, topic);
        qs("#section-list").append(new_section.to_html)

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
        qs(".create-btn").onclick = () => {
        }

        fetch(topics_url + `/${topic.id}`, reqObj("GET", null, localStorage.getItem("token")))
        .then(resp => resp.json())
        .then(req_topic => {
            const ul = qs("#section-list");
            for (const section of req_topic.sections){
                let new_section = new Section(section.title, section.id, topic);
                (!target_section && section == req_topic.sections[0]) ? target_section = new_section : false;
                ul.append(new_section.to_html());
                if (section.id == target_section.id){
                    const section_HTML = qs(`#${topic.title}-section-${section.id}`);
                    section_HTML.style.backgroundColor = invert(topic.color);
                    section_HTML.style.color = getContrast(invert(topic.color));
                    target_section.load_note()
                }
            }          
        })
        
            
    }

    static load(topic){
        UserMenu.create(Section)
        Section.load_sidebar(topic);
    }

    static hide(){
        qs("#sidebar").className = "w3-sidebar w3-bar-block w3-blue";
        const sidebar = qs("#sidebar")
        sidebar.removeChild(sidebar.children[0]);
        sidebar.style.display = "none";
        qs("#user-btn").remove()
        clear_Listener("submit", EditForm.listener)
    }

    static redirect(redirect_fn){
        this.hide();
        redirect_fn();
    }
}