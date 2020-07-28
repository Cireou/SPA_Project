const shared_topics_url = "http://localhost:3000/user_shared_topics"
class Card{
    constructor(id, color, title, owner = null){
        this.id = id;
        this.color = color;
        this.title = title;
        this.owner = owner;
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

        third.innerHTML = ` <div style = "position: relative; color: ${getContrast(this.color)};"> 
                                <div id = "card-cont-${this.id}" class="w3-card-4 w3-hover-shadow w3-center w3-round-xlarge" 
                                        style="height: 350px; max-width: 3500px; background-color:${this.color};">
                                    <br>
                                    <br>
                                    <div class="w3-container w3-center">
                                        <a href="#" id = "card-title-${this.id}" class="w3-xxlarge"></a>
                                    </div>
                                    <br> 
                                    <div class = "owner-div">
                                    </div>
                                    <br> 
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
                                </div>  
                                <div id = "share-container"></div>
                            </div>`
        const card_title = third.querySelector(`#card-title-${this.id}`)
        card_title.innerText = this.title;
        card_title.addEventListener("click", this.section_listener.bind(this))
        
        third.querySelector(`#card-edit-${this.id}`).addEventListener("click", () => {this.edit_loader(third.children[0])})
        return third;
    }

    section_listener(){
        localStorage.setItem("topic", JSON.stringify(this))
        MyNotes.redirect(SectionsPage.load)
    }
    edit_loader(card_container){
        const item = qs(`#card-title-${this.id}`)
        const new_item = item.cloneNode(true);
        item.parentNode.replaceChild(new_item, item)
        
        qs(`#card-title-${this.id}`).contentEditable = "true";
        qs(`#card-${this.id}-btns`).style.display = "none";

        const temp_vals = ce("div")
        temp_vals.id = "temp-vals"
        temp_vals.innerHTML = `Choose a New Color: <input id='colorpicker-edit'>
                                <br><br><br>
                                <button id = "card-edit-btn" class="w3-button w3-teal w3-padding-16"> 
                                    Update!
                                </button>` 

        qs(`#card-cont-${this.id}`).append(temp_vals);
        $("#colorpicker-edit").spectrum(spectrum_map({color: this.color, card: qs(`#card-cont-${this.id}`)}));

        qs("#card-edit-btn").addEventListener("click",  () => {
            this.title = qs(`#card-title-${this.id}`).innerText;
            this.color = qs(".sp-preview-inner").style.backgroundColor;
            fetch(topics_url + `/${this.id}`, reqObj("PATCH", this.data(), getToken()))
            .then(resp => resp.json())
            .then(new_items => {
                MyNotes.load_cards(card_container.children[0]);
            })
        })
        
    }
}

class MyNotesCard extends Card{
    to_html(){
        const third = super.to_html();
        this.add_share_listener(third)
        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    add_share_listener(card){
        const share_div = card.querySelector("#share-container")
        share_div.innerHTML = `<i class = "icons share_btn fa fa-share-square-o w3-xlarge"> </i>
                                <div id="share-form" style= "display: none">
                                    <form>
                                        <input type="text" name="search" placeholder="Share your note with other users! Separate multiple emails with commas!">
                                        <input type = "submit" value = "Share!">
                                    </form>
                                </div>`
        share_div.querySelector(".icons").addEventListener("click", () => {
            this.share_listener(this, share_div.querySelector("#share-form"))
        })
    }

    share_listener(card, share_form){
        if (share_form.style.display == "none"){
            share_form.style.display = "block"
            const submit_btn = share_form.querySelector("input[type='submit']");
            share_form.addEventListener("submit", () => {this.share_form_listener(card, share_form)})
        } else {
            share_form.style.display = "none";
        }
    }

    share_form_listener(card, form){
        event.preventDefault()
        fetch(shared_topics_url, reqObj("POST", {
            shared_topic_id: card.id,
            sharee_email: event.target[0].value
        }, getToken()))
        .then(resp => resp.json())
        .then(info => {
            form.style.display = "none"
        })
    }
    delete_loader(){
        fetch(topics_url + `/${this.id}`, reqObj("DELETE", null, getToken()))
        .then(resp => {MyNotes.load_cards(qs("#cards-container"))})
    }

}

class SharedNotesCard extends Card{

    constructor(id, color, title, owner, sharee, share_id){
        super(id, color, title, owner);
        this.sharee = sharee;
        this.shared_topic_id = share_id
    }

    to_html(){
        const third = super.to_html();
        third.querySelector(".owner-div").innerHTML =  `<i class="fa fa-user owner-div-item"></i> <h2 class = "owner-div-item "> ${this.owner}</h2>`
        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    delete_loader(){
        debugger
        fetch(shared_topics_url + `/${this.shared_topic_id}`, reqObj("DELETE", null, getToken()))
        .then(resp => {SharedNotes.load_cards(qs("#cards-container"))})
    }

}