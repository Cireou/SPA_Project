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
        card_title.addEventListener("click", () => {
            localStorage.setItem("topic", this)
            MyNotes.redirect(Section.load)
        })
        
        third.querySelector(`#card-edit-${this.id}`).addEventListener("click", () => {this.edit_loader(third.children[0])})
        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    edit_loader(card_container){
        qs(`#card-title-${this.id}`).contentEditable = "true";
        qs(`#card-${this.id}-btns`).style.display = "none";
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
            fetch(topics_url + `/${this.id}`, reqObj("PATCH", this.data(), getToken()))
            .then(resp => resp.json())
            .then(new_items => {
                MyNotes.load_cards(card_container);
            })
        })
        
    }

    delete_loader(){
        fetch(topics_url + `/${this.id}`, reqObj("DELETE", null, getToken()))
        .then(resp => {MyNotes.load_cards(qs("#cards-container"))})
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
    static reset(){
        qs('#new-topic-title').innerText = "New Title";
        qs(".sp-preview-inner").style.backgroundColor = "rgb(100,100,100)";
        qs("#note-modal-card").style.backgroundColor = "rgb(100,100,100)";
    }

    static color_listener(){
        const color_rbg = qs(".sp-preview-inner").style.backgroundColor
        let modal_card = qs("#note-modal-card");
        modal_card.style.backgroundColor = `${color_rbg}`;
        modal_card.style.color = `${getContrast(color_rbg)}`
    }

    static submit_listener(){
        fetch(topics_url, reqObj("POST", New_Note_Modal.data(), getToken()))
        .then(resp => resp.json())
        .then(new_topic => {
            modal_note.style.display = "none";
            MyNotes.load_cards();
        })
    }
    static add_listeners(){
        qs(".sp-choose").addEventListener("click", this.color_listener)
        qs("#note-submit").addEventListener("click", this.submit_listener)
    }
}

class MyNotes extends MenuItem{
    static menu_item = () => qs("#menu-my-notes")

    static load_sidebar() {
        super.load()
        this.menu_item().className = "w3-bar-item w3-button w3-indigo w3-hover-indigo"
    }

    static load_cards(scroll_to_val = null){
        AUTH_CONTAINER.style.display = "block"
        AUTH_CONTAINER.innerText = ""

        fetch(users_url, reqObj("GET",null, getToken()))
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
                AUTH_CONTAINER.append(row_div);
            }

            (scroll_to_val) ? qs(`#${scroll_to_val.id}`).scrollIntoView() : true;
        })
    }

    static load(){
        MyNotes.load_sidebar();
        MyNotes.load_cards();
    }

    static hide(){
        //1. Hide the Sidebar
        MenuItem.hide();

        //2. Clear out inner contents (Topic Cards)
        AUTH_CONTAINER.innerText = ""

        clear_Listener("submit", EditForm.listener)
    }

    static redirect(redirect_fn){
        MyNotes.hide()
        redirect_fn()
    }
}

