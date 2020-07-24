const sections_url = "http://localhost:3000/sections"

class Section{

    constructor(title, id, topic){
        this.title = title;
        this.id = id;
        this.topic = topic;
    }

    delete_listener(){
        fetch(sections_url + `/${this.id}`,reqObj("DELETE", null, localStorage.getItem("token")))
        .then(resp => (Section.load_sidebar(this.topic)))
    }

    edit_listener(){

    }

    to_html(){
        const li = ce("li");
        li.id = `${this.topic.title}-section-${this.id}`;
        
        const contrast = getContrast(this.topic.color);
        li.className = `w3-display-container w3-hover-${(contrast == "white") ? "black" : "white"}`;
        li.innerText = this.title;
        li.style.backgroundColor = `${add_opacity(this.topic.color)}`

        const i = ce("i");
        i.className = "fa fa-pencil w3-button w3-transparent"

        const span = ce("span");
        span.className = "w3-button w3-transparent w3-display-right";
        span.innerText = "×";
        span.addEventListener("click", () => {
            this.delete_listener()
        })
        
        li.append(i,span);
        return li;
    }

    static load_sidebar(topic, default_sidebar = true){
        const opacity_color = add_opacity(topic.color);

        const sidebar= qs("#sidebar");
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
                ul.append(new_section.to_html());
            }
            const first_section = qs("#section-list").children[0];
            (!!first_section && default_sidebar) ? 
                first_section.style.backgroundColor = invert(topic.color) : 
                false;
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