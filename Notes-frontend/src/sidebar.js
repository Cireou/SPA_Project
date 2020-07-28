class MenuItem{

    static load(){
        SIDEBAR.style.display = "block";
        SIDEBAR.innerHTML += `<div>
                <a href="#" id = "menu-home" class="w3-bar-item w3-button 
                            w3-hover-light-blue" style = "display: none"> 
                    <div class="w3-container w3-center">
                        <h3> Home</h3>
                    </div>
                </a>
                <a href="#" id = "menu-my-notes" class="w3-bar-item w3-button
                         w3-button w3-hover-light-blue"">
                    <div class="w3-container w3-center ">
                        <h3> My Notes</h3>
                    </div>
                </a>
                <a href="#" id = "menu-shared-notes" class="w3-bar-item 
                            w3-button w3-hover-light-blue">
                    <div class="w3-container w3-center ">
                        <h3> Shared Notes</h3>
                    </div>
                </a>
                <button class="create-btn w3-button w3-xlarge w3-black w3-round-large">+ Create Note</button></div>`
        qs(".create-btn").onclick = () => {
            modal_note.style.display = 'block';
            New_Note_Modal.reset();
            New_Note_Modal.add_listeners();
        }
        //qs("#menu-home").onclick = () => Home.load();
        qs("#menu-my-notes").onclick = () => MenuItem.redirect(MyNotes.load);
        qs("#menu-shared-notes").onclick = () => MenuItem.redirect(SharedNotes.load);
    }
    static hide(){
        SIDEBAR.removeChild(sidebar.children[0]);
        SIDEBAR.style.display = "none";
        SIDEBAR.className ="w3-sidebar w3-bar-block w3-blue"

         //Clear out inner contents (Topic Cards)
         AUTH_CONTAINER.innerText = ""
 
         clear_Listener("submit", EditForm.listener)
    }

    static redirect(redirect_fn){
        MenuItem.hide();
        redirect_fn();
    }
}