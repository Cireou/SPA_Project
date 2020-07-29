const topics_url = "http://localhost:3000/topics"

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
        qs("#note-modal-card").style.backgroundColor = "rgb(100,100,100)";
    }

    static submit_listener(){
        fetch(topics_url, reqObj("POST", New_Note_Modal.data(), getToken()))
        .then(resp => resp.json())
        .then(new_topic => {
            modal_note.style.display = "none";
            MenuItem.redirect(MyNotes.load)
        })
    }
    static add_listeners(){
        $("#colorpicker").spectrum(spectrum_map({color: this.color, card: qs("#note-modal-card")}));
        qs("#note-submit").addEventListener("click", this.submit_listener)
    }
}

class MyNotes extends MenuItem{
    static menu_item = () => qs("#menu-my-notes")

    static load_sidebar() {
        super.load()
        this.menu_item().className = "w3-bar-item w3-button w3-indigo w3-hover-indigo"
    }

    static load_empty_page(){
        AUTH_CONTAINER.innerHTML = NO_SECTION_HTML
        qs(".title").innerText = "You Haven't Made Any Notes Yet!"
        qs(".footer").innerText = `Create a new topic for your notes first by clicking "Create Note!"`
    }

    static load_cards(scroll_to_val = null){
        AUTH_CONTAINER.style.display = "block"
        AUTH_CONTAINER.innerText = ""

        fetch(users_url, reqObj("GET",null, getToken()))
        .then(resp => resp.json())
        .then(user_info => {
            if (user_info.topics.length == 0){this.load_empty_page()}
            for (let i = 0; i < user_info.topics.length; i+=3){
                let row_div = ce("div")
                row_div.style = "margin:0 -16px"
                for (let j = 0; (j + i < user_info.topics.length && j < 3); j++){
                    let card_info = user_info.topics[i + j];
                    let new_card = new MyNotesCard(card_info.id, card_info.color, card_info.title, card_info.img_url)
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

    static redirect(redirect_fn){
        MyNotes.hide()
        redirect_fn()
    }
}

