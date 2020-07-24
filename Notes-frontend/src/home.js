const topics_url = "http://localhost:3000/topics"

class Card{
    constructor(id, color, title, user = null){
        this.id = id;
        this.color = color
        this.title = title;
        this.user = user;
    }

    data(){
        return {
            topic:{
                title: this.title,
                color: this.color
            }
        }
    }
    to_html(){
        const third = ce("div");
        third.className = "w3-third w3-padding-large";

        third.innerHTML = ` <div id = "card-cont-${this.id}" class="w3-card-4 w3-hover-shadow w3-center w3-round-xlarge" 
                                style="height: 350px; max-width: 3500px; background-color:${this.color}; color: ${getContrast(this.color)}">
                                <br><br><br>
                                <div class="w3-container w3-center">
                                    <a href="#" id = "card-title-${this.id}" class="w3-xxlarge"></a>
                                </div>
                                <br> <br> <br>
                                <div id = "card-${this.id}-btns" class="w3-container w3-center">
                                    <div class="w3-row w3-padding-16">
                                        <div class="w3-half ">
                                            <h2>
                                                <i id="card-edit-${this.id}" class="fa fa-pencil-square-o w3-xxlarge w3-hover w3-hover-text-green"></i>
                                            </h2>
                                        </div>
                                        <div class="w3-half">
                                            <h2>
                                                <i id="card-delete-${this.id}" class="fa fa-trash-o w3-xxlarge w3-hover w3-hover-text-red"></i>
                                            </h2>
                                        </div>
                                    </div>
                                </div>
                            </div>`
        const card_title = third.querySelector(`#card-title-${this.id}`)
        card_title.innerText = this.title;
        card_title.addEventListener("click", () => Home.redirect(Section.load, this))
        
        third.querySelector(`#card-edit-${this.id}`).addEventListener("click", () => {this.edit_loader(third.children[0])})
        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    edit_loader(card_container){
        qs(`#card-title-${this.id}`).contentEditable = "true";
        qs(`#card-${this.id}-btns`).style.display = "none";

        ce 
        const new_HTML = `
            <div id = "temp-vals">
                Choose a New Color: <input id='colorpicker-edit'>
                <button id = "card-edit-btn" 
                    class="w3-button w3-block w3-teal w3-padding-16 w3-section w3-center"> 
                    Update!
                </button>
            </div>
        `
        card_container.innerHTML += new_HTML
        $("#colorpicker-edit").spectrum({
            showPaletteOnly: true,
            togglePaletteOnly: true,
            togglePaletteMoreText: 'more',
            togglePaletteLessText: 'less',
            type: "color",
            allowEmpty: "false"
          });
        qs("#card-edit-btn").addEventListener("click",  () => {
            this.title = qs(`#card-title-${this.id}`).innerText;
            this.color = qs(".sp-preview-inner").style.backgroundColor;
            fetch(topics_url + `/${this.id}`, reqObj("PATCH", this.data(), localStorage.getItem("token")))
            .then(resp => resp.json())
            .then(new_items => {
                Home.load_cards(qs("#cards-container"), card_container);
            })
        })
        
    }

    delete_loader(){
        fetch(topics_url + `/${this.id}`, reqObj("DELETE", null, localStorage.getItem("token")))
        .then(resp => {Home.load_cards(qs("#cards-container"))})
    }
}

class EditForm extends Form{
    static title = "Edit User Profile"
    static btn_val = "Submit Changes"

    static form_items = {
        "password":{
            "Password Confirmation": "Confirm your Password",
            "Password": "Your New Password (Or Retype Old Password)"
        } ,
        "text":{
            "Email": "Your Email!",
            "Username": "Your Username!"
        }
    }

    static data(event){ 
        const new_pass = event.target[2].value;
        const new_pass_conf = event.target[3].value
        return {
            users:{
                username: event.target[0].value,
                email: event.target[1].value,
                ...(new_pass!="" && {password: new_pass}),
                ...(new_pass_conf!="" && {password_confirmation: new_pass_conf})
            }
        }
    }

    static listener(){
        event.preventDefault();
        fetch(users_url, reqObj("PATCH",  EditForm.data(event), localStorage.getItem("token")))
        .then(resp => resp.json())
        .then(JSON => {
            console.log(JSON)
        })
    }

    static load(){
        Form.load(this.title, this.form_items, this.btn_val);
        form.addEventListener("submit", this.listener)
        fetch(users_url, reqObj("GET",null, localStorage.getItem("token")))
        .then(resp => resp.json())
        .then(user_info => {
            const form_texts = EditForm.form_items.text
            for (const key in form_texts){
                qs(`#${key}`).value = user_info[key.toLowerCase()]
            }
        })
    }
}

class New_Note_Modal{
    static data(){ 
        return {
            topic:{
                title: qs("#new-topic-title").innerText,
                color: qs(".sp-preview-inner").style.backgroundColor
            }
        }
    }
    static color_listener(){
        const color_rbg = qs(".sp-preview-inner").style.backgroundColor
        let modal_card = qs("#note-modal-card");
        modal_card.style.backgroundColor = `${color_rbg}`;
        modal_card.style.color = `${getContrast(color_rbg)}`
    }

    static submit_listener(){
        fetch(topics_url, reqObj("POST", New_Note_Modal.data(), localStorage.getItem("token")))
        .then(resp => resp.json())
        .then(new_topic => {
            qs('#note-modal').style.display = "none";
            Home.load_cards(qs("#cards-container"));
        })
    }
    static add_listeners(){
        qs(".sp-choose").addEventListener("click", this.color_listener)
        qs("#note-submit").addEventListener("click", this.submit_listener)
    }
}

class Home{
    
    static load_sidebar() {
        const sidebar= qs("#sidebar");
        sidebar.style.display = "block";
        sidebar.innerHTML += `<div><a href="#" class="w3-bar-item w3-button w3-hover-light-blue"> 
                                    <div class="w3-container w3-center ">
                                        <h3> Home</h3>
                                    </div>
                              </a>
                              <a href="#" class="w3-bar-item w3-button w3-indigo w3-hover-indigo w3-hover-light-blue">
                                    <div class="w3-container w3-center ">
                                        <h3> My Notes</h3>
                                    </div>
                                </a>
                            <a href="#" class="w3-bar-item w3-button w3-hover-light-blue">
                                
                                <div class="w3-container w3-center ">
                                    <h3> Shared Notes</h3>
                                    </div>
                            </a>
                            <button class="create-btn w3-button w3-xlarge w3-black w3-round-large">+ Create Note</button></div>`
        qs(".create-btn").onclick = () => {
            qs('#note-modal').style.display = 'block';
            New_Note_Modal.add_listeners();
        }

    }

    static load_cards(container_arg, scroll_to_val = null){
        container_arg.innerText = "";
        fetch(users_url, reqObj("GET",null, localStorage.getItem("token")))
        .then(resp => resp.json())
        .then(user_info => {
            for (let i = 0; i < user_info.topics.length; i+=3){
                let row_div = ce("div")
                row_div.className = "w3-row-padding"
                row_div.style = "margin:0 -16px"
                for (let j = 0; (j + i < user_info.topics.length && j < 3); j++){
                    let card_info = user_info.topics[i + j];
                    let new_card = new Card(card_info.id, card_info.color, card_info.title, null)
                    row_div.append(new_card.to_html())
                }
                container_arg.append(row_div);
            }

            (scroll_to_val) ? qs(`#${scroll_to_val.id}`).scrollIntoView() : true;
        })
    }

    static load_grid(){
        const block1 = qs("#block-1");

        const grid = ce("div");
        grid.id = "grid";

        const container = ce("div");
        container.id = "cards-container"
        container.style = "margin-left:200px";
        container.className = "w3-padding-large"
        
        
        grid.append(container)

        this.load_cards(container)
        block1.append(grid)                                      
    }


    static load(){
        UserMenu.create(Home)
        Home.load_sidebar();
        Home.load_grid();
    }

    static hide(){
        const sidebar = qs("#sidebar")
        sidebar.removeChild(sidebar.children[0]);
        sidebar.style.display = "none";

        qs("#grid").remove()
        qs("#user-btn").remove()
        clear_Listener("submit", EditForm.listener)
    }

    static redirect(redirect_fn, arg = null){
        Home.hide()
        if (!!arg){
            redirect_fn(arg)
        } else{
            redirect_fn()
        }
    }
}

