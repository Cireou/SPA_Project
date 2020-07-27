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

        third.innerHTML = ` <div id = "card-cont-${this.id}" class="w3-card-4 w3-hover-shadow w3-center w3-round-xlarge" 
                                style="height: 350px; max-width: 3500px; background-color:${this.color}; color: ${getContrast(this.color)}">
                                <br>
                                <div id = "share-container">
                                </div>
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
                            </div>`
        const card_title = third.querySelector(`#card-title-${this.id}`)
        card_title.innerText = this.title;
        card_title.addEventListener("click", () => {
            localStorage.setItem("topic", JSON.stringify(this))
            MyNotes.redirect(SectionsPage.load)
        })
        
        third.querySelector(`#card-edit-${this.id}`).addEventListener("click", () => {this.edit_loader(third.children[0])})
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
        share_div.querySelector(".icons").addEventListener("click", this.share_listener.bind(this))
    }

    share_listener(){
        const share_form = qs("#share-form");
        if (share_form.style.display == "none"){
            share_form.style.display = "block"
            const submit_btn = share_form.querySelector("input[type='submit']");
            submit_btn.addEventListener("submit", () => {
                event.preventDefault();
                debugger
                fetch(shared_topics_url, reqObj("POST", {}))
                .then(resp => resp.json());
            })
        } else {
            share_form.style.display = "none";
        }
    }
    delete_loader(){
        fetch(topics_url + `/${this.id}`, reqObj("DELETE", null, getToken()))
        .then(resp => {MyNotes.load_cards(qs("#cards-container"))})
    }

}

class SharedNotesCard extends Card{

    constructor(id, color, title, owner, sharee){
        super(id, color, title, owner);
        this.sharee = sharee;
    }

    to_html(){
        const third = super.to_html();
        third.querySelector(".owner-div").innerHTML =  `<i class="fa fa-user owner-div-item"></i> <h2 class = "owner-div-item "> ${this.owner}</h2>`
        third.querySelector(`#card-delete-${this.id}`).addEventListener("click", this.delete_loader.bind(this))
        return third;
    }

    delete_loader(){
        fetch(shared_topics_url + `/${this.id}`, reqObj("DELETE", null, getToken()))
        .then(resp => {MyNotes.load_cards(qs("#cards-container"))})
    }

}