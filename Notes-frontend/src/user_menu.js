class UserMenu{
    static user_icon = () =>  qs("#user-btn");
    static create(){
        const right_nav = qs("#right-nav");
            right_nav.innerHTML += `
            <div id = "user-btn" class="w3-dropdown-hover w3-hide-small w3-right">
                <button class="w3-padding-large w3-button" title="User Settings"> <i class="fa fa-user"></i> <i class="fa fa-caret-down"></i> </button> 
                <div class="w3-dropdown-content w3-bar-block" style="right:0">
                    <div id = "edit-prof" class="w3-bar-item w3-button w3-grey" >Edit Profile</div>
                    <div id= "logout" class="w3-bar-item w3-button w3-grey">Logout</div>
                </div>
            </div>`

            qs("#edit-prof").onclick = () => {
                EditForm.load()
            }
    
            qs("#logout").onclick = () =>{
                localStorage.clear();
                AuthenticatedScreen.redirect(Welcome.load);
            }
    }

    static hide(){
        this.user_icon().remove();
    }
}

class EditForm extends Form{
    static title = "Edit User Profile"
    static btn_val = "Submit Changes"
    static linker_map = () => {
        return {
            text: "Delete Account",
            listener: this.destroyer_listener
        }
    }

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

    static destroyer_listener(){
        fetch(users_url, reqObj("DELETE", null, getToken()))
        .then(values => {AuthenticatedScreen.redirect(Welcome.load)})
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
            modal_form.style.display = "none";
        })
    }

    static load(){
        Form.load(this.title, this.form_items, this.linker_map(), this.btn_val);
        form.addEventListener("submit", this.listener)
        fetch(users_url, reqObj("GET",null, getToken()))
        .then(resp => resp.json())
        .then(user_info => {
            const form_texts = EditForm.form_items.text
            for (const key in form_texts){
                qs(`#${key}`).value = user_info[key.toLowerCase()]
            }
        })
    }
}

class AuthenticatedScreen{

    //Triggered on Login and Sign Up
    static load(){
        //1. Update Logo to redirect to Home
        HOME_BTN.onclick = () => {
            clearStorageExcept(["token"])
            MenuItem.hide();
            MyNotes.load();
        }

        //2. Update User Icon to edit and logout
        UserMenu.create(this)

        //4. Enable Body.
        AUTH_CONTAINER.style.display = "block";
        
        //5. Redirect to Home page
        MyNotes.load()
    }

    //Only Triggered on Logout
    static hide(){
        //1. Remove User Icon.
        UserMenu.hide();

        //2. Disable Logo from redirecting.
        $(`${HOME_BTN.id}`).off();

        //3. Remove Sidebar.
        MenuItem.hide();

        //4. Clear out Body (Grid/Note)
        AUTH_CONTAINER.innerText = "";

        //5. Hide Edit User Modals
        qs("#form-modal").style.display = "none"
    }

    static redirect(redirect_fn){
        this.hide();
        redirect_fn();
    }
}