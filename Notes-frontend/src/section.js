class Section{

    static load_sidebar(){
        const sidebar= qs("#sidebar");
        sidebar.style.display = "block";
        sidebar.innerHTML += `<div>
                                <button class="create-btn w3-button w3-xlarge w3-black w3-round-large">+ Create Note</button>
                            </div>`
        qs("#new-note-btn").onclick = () => {
        }
    }

    static load(){
        UserMenu.create(Home)
        Section.load_sidebar();
    }

    static hide(){
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