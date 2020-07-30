const shared_topics_url = "http://localhost:3000/user_shared_topics"
class Card{
    constructor(id, color, title, img_url, owner = null){
        this.id = id;
        this.color = color;
        this.title = title;
        this.img_url = img_url
        this.owner = owner;
    }

    data(){
        
        return {
            topic:{
                title: this.title,
                color: this.color,
                img_url: this.img_url
            }
        }
    }
    to_html(){
        const third = ce("div");
        third.className = "row w3-third"
        third.innerHTML = `<div style = "position: relative; color: ${getContrast(this.color)};"> 
                                <div id = "card-cont-${this.id}" class="w3-card-4 w3-hover-shadow w3-center w3-round-xlarge" 
                                        style="height: 370px; max-width: 420px;" >
                                    <div class="w3-container w3-center ">
                                        <a href="#" id = "card-title-${this.id}" class="w3-xxlarge" style = "position: absolute; left: 35%; top: 10%;"> 
                                            <h2 class = "card-cont" contentEditable = "false"> </h2>
                                        </a>
                                    </div> 
                                    <div class = "owner-div card-cont">
                                    </div>
                                    <br> 
                                    <div id = "card-${this.id}-btns" class="w3-container w3-center">
                                        <div class="w3-row w3-padding-16">
                                            <div class="w3-half " >
                                                <h2>
                                                    <i id="card-edit-${this.id}" class=" card-cont fa fa-pencil-square-o 
                                                        w3-xxlarge w3-hover w3-hover-text-green"
                                                        style = "position: absolute; left: 25%; bottom: 14%"
                                                    ></i>
                                                </h2>
                                            </div>
                                            <div class="w3-half">
                                                <h2>
                                                    <i id="card-delete-${this.id}" class="card-cont fa fa-trash-o w3-xxlarge w3-hover w3-hover-text-red"
                                                    style = "position: absolute; right: 25%; bottom: 14%"
                                                    ></i>
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                </div>  
                                <div id = "share-container"></div>
                            </div>`;
        third.querySelector(`#card-cont-${this.id}`).style.background= `${this.color} ` +  to_bg_image(this.img_url)
        third.querySelector(`#card-cont-${this.id}`).style.backgroundSize = "100% 100%"
        const card_title = third.querySelector(`#card-title-${this.id}`).querySelector("h2")
        card_title.innerText = this.title;
        card_title.addEventListener("click", this.section_listener.bind(this))
        
        return third;
    }

    section_listener(){
        localStorage.setItem("topic", JSON.stringify(this))
        MyNotes.redirect(SectionsPage.load)
    }
    edit_loader(card_container, reload_class){
        const item = qs(`#card-title-${this.id}`)
        const new_item = item.cloneNode(true);
        item.parentNode.replaceChild(new_item, item)

        new_item.querySelector("h2").contentEditable = "true"
        qs(`#card-${this.id}-btns`).style.display = "none";

        const temp_vals = ce("div")
        temp_vals.id = "temp-vals"
        temp_vals.innerHTML = `
                                <div class = "card-cont">New Background Image: </div> 
                                <input id = "img-url" placeholder = "Image URL" value = "${this.img_url}"> <br> 
                                <h4 class = "card-cont"> AND/OR </h4> <br>
                                <div class = "card-cont"> Choose a New Color: </div>
                                <input id='colorpicker-edit'>
                                <br><br>
                                <button id = "card-edit-btn" class="w3-button w3-teal"> 
                                    Update!
                                </button>` ;
        qs(`#card-cont-${this.id}`).append(temp_vals);
        [...temp_vals.querySelectorAll(".card-cont")].forEach(item => {
            item.style.backgroundColor = this.color
            item.style.color = getContrast(this.color);
        })
        $("#colorpicker-edit").spectrum(spectrum_map({color: this.color, card: qs(`#card-cont-${this.id}`)}));

        qs("#card-edit-btn").addEventListener("click",  () => {
            this.title = qs(`#card-title-${this.id}`).innerText;
            this.color = qs(".sp-preview-inner").style.backgroundColor;
            this.img_url = new String(`${qs(`#img-url`).value}`)
            fetch(topics_url + `/${this.id}`, reqObj("PATCH", this.data(), getToken()))
            .then(resp => resp.json())
            .then(new_items => {
                reload_class.load_cards(card_container.children[0]);
            })
        })
        
    }
}

class MyNotesCard extends Card{
    to_html(){
        const third = super.to_html();
        this.add_share_listener(third);
        [...third.querySelectorAll(".card-cont")].forEach(item => item.style.backgroundColor = this.color)
        third.querySelector(`#card-edit-${this.id}`).addEventListener("click", () => {
            this.edit_loader(third.children[0], MyNotes)
            qs("#temp-vals").style = "position: absolute; top: 34%; left: 7%"
        })
        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    add_share_listener(card){
        const share_div = card.querySelector("#share-container")
        share_div.innerHTML = `<i class = "icons share_btn card-cont fa fa-share-square-o w3-xlarge"> </i>
                                <div id="share-form" style= "display: none">
                                    <form>
                                        <input type="text" name="search" placeholder="Sharee's Email">
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

    constructor(id, color, title, img_url, owner, owner_img, sharee, share_id){
        super(id, color, title, img_url, owner);
        this.owner_img = owner_img;
        this.sharee = sharee;
        this.shared_topic_id = share_id
    }
    add_owner_div(container){
        const owner_div = container.querySelector(".owner-div")
        owner_div.style.display = "block"
        owner_div.innerHTML =  `<div> 
                                    <div id="owner_img" class="image-cropper" style = "float: left;"></div>
                                    <h2 class = "owner-div-item" style="float:right">  ${this.owner}</h2>
                                </div`
        owner_div.querySelector("h2").style = "margin: 0px 0;"
        owner_div.querySelector("#owner_img").style.backgroundImage = to_bg_image(this.owner_img)
    }

    to_html(){
        const third = super.to_html();
        [...third.querySelectorAll(".card-cont")].forEach(item => item.style.backgroundColor = this.color)
        this.add_owner_div(third);
        third.querySelector(`#card-edit-${this.id}`).addEventListener("click", () => {
            this.edit_loader(third.children[0], SharedNotes)
            qs(`#card-title-${this.id}`).style.top = "1%"
            qs("h2.card-cont").style.top = "0%";
            qs(".owner-div").style.top = "20%"
            qs("#temp-vals").style = "position: absolute; top: 37%; left: 7%"
        })

        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    delete_loader(){
        fetch(shared_topics_url + `/${this.shared_topic_id}`, reqObj("DELETE", null, getToken()))
        .then(resp => {SharedNotes.load_cards(qs("#cards-container"))})
    }

}