class SharedNotes extends MenuItem{
    static menu_item = () => qs("#menu-shared-notes")

    static load_sidebar() {
        super.load()
        this.menu_item().className = "w3-bar-item w3-button w3-indigo w3-hover-indigo"
    }

    static load_empty_page(){
        AUTH_CONTAINER.innerHTML = NO_SECTION_HTML
        qs(".title").innerText = "No Notes Have Been Shared With You Yet!"
        qs(".footer").innerText = `Feel free to share one of your notes though!`
    }

    static load_cards(scroll_to_val = null){
        AUTH_CONTAINER.style.display = "block"
        AUTH_CONTAINER.innerText = ""

        fetch(shared_topics_url, reqObj("GET",null, getToken()))
        .then(resp => resp.json())
        .then(shared_topics => {
            if (shared_topics.length == 0){this.load_empty_page()}
            for (let i = 0; i < shared_topics.length; i+=3){
                let row_div = ce("div")
                row_div.className = "w3-row-padding"
                row_div.style = "margin:0 -16px"
                for (let j = 0; (j + i < shared_topics.length && j < 3); j++){
                    let shared_info = shared_topics[i + j];
                    let card_info = shared_info.shared_topic
                    let new_card = new SharedNotesCard(card_info.id, card_info.color, card_info.title, card_info.img_url, 
                        shared_info.owner.username, shared_info.owner.image_url, shared_info.sharee.username, shared_info.id)
                    row_div.append(new_card.to_html())
                }
                AUTH_CONTAINER.append(row_div);
            }

            (scroll_to_val) ? qs(`#${scroll_to_val.id}`).scrollIntoView() : true;
        })
    }

    static load(){
        SharedNotes.load_sidebar();
        SharedNotes.load_cards();
    }

    static redirect(redirect_fn){
        SharedNotes.hide()
        redirect_fn()
    }
}