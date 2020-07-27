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
            MenuItem.redirect(MyNotes.load)
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
                    let new_card = new MyNotesCard(card_info.id, card_info.color, card_info.title, null)
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

