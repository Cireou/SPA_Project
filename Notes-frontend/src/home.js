const topics_url = "http://localhost:3000/topics"

class Card{
    constructor(id, title, user = null){
        this.id = id;
        this.title = title;
        this.user = user;
    }

    to_html(){
        const third = ce("div");
        third.className = "w3-third w3-padding-large";


        third.innerHTML = ` <div class="w3-card-4 w3-dark-grey w3-hover-shadow w3-center w3-round-xlarge" style="height: 350px; max-width: 3500px;">
                                <br><br><br>
                                <div class="w3-container w3-center ">
                                    <a href="#" id = "card-title-${this.id}" class="w3-xxlarge"></a>
                                </div>
                                <div class="w3-container w3-center">
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
        third.querySelector(`#card-title-${this.id}`).innerText = this.title;
        third.querySelector(`#card-edit-${this.id}`).addEventListener("click", this.edit_loader.bind(this))
        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    edit_loader(){
        debugger
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

class Home{
    
    static create_user_menu(){
        if (qs("#user_btn")){
            qs("#user_btn").style.display = "block";
            return;
        }

        const right_nav = qs("#right-nav");
        
        right_nav.innerHTML += `
        <div id = "user-btn" class="w3-dropdown-hover w3-hide-small w3-right">
            <button class="w3-padding-large w3-button" title="User Settings"> <i class="fa fa-user"></i> <i class="fa fa-caret-down"></i> </button> 
            <div class="w3-dropdown-content w3-bar-block" style="right:0">
                <div id = "edit-prof" class="w3-bar-item w3-button w3-grey" >Edit Profile</div>
                <div id= "logout" class="w3-bar-item w3-button w3-grey">Logout</div>
            </div>
        </div>`

        qs("#edit-prof").addEventListener("click", () =>{
            EditForm.load()
        })
        

        qs("#logout").addEventListener("click", () => {
            localStorage.clear();
            Home.hide();
        })
    }

    static load_sidebar() {
        const block1 = qs("#block-1");
        block1.innerHTML += `<div id = "sidebar" class="w3-sidebar w3-bar-block w3-blue" style="width:200px">
            <a href="#" class="w3-bar-item w3-button w3-hover-light-blue"> 

                <div class="w3-container w3-center ">
                <h3> Home</h3>
                </div>
                </a>
            
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
        </div>`

        const new_note_btn = ce("button");
        new_note_btn.id = "new-note-btn";
        new_note_btn.className = "w3-button w3-xlarge w3-black w3-round-large"    
        new_note_btn.innerText = "+ Create Note"
        qs("#sidebar").append(new_note_btn);
    }

    static load_cards(container_arg){
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
                    let new_card = new Card(card_info.id, card_info.title, null)
                    row_div.append(new_card.to_html())
                }
                container_arg.append(row_div);
            }
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
        qs("#form-modal").style.display='none'
        qs("#signup-btn").style.display='none'
        qs("#login-btn").style.display='none'
        this.create_user_menu();
        this.load_sidebar();
        this.load_grid();
    }

    static hide(){
        qs("#sidebar").style.display= "none"
        qs("#grid").style.display = "none"
        qs("#user-btn").style.display = "none"
        clear_Listener("submit", EditForm.listener)

        qs("#signup-btn").style.display= "block"
        qs("#login-btn").style.display= "block"
    }
}