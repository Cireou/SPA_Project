
class UserMenu{
    static user_icon = () =>  qs("#user-btn");
    static create(){
        const right_nav = qs("#right-nav");
            right_nav.innerHTML += `
            <div id = "user-btn" class="w3-dropdown-hover w3-hide-small w3-right"">
                <div id="usr_img" class="image-cropper"></div>
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
            fetch(users_url, reqObj("GET", null, getToken()))
            .then(resp => resp.json())
            .then(user_info => qs("#usr_img").style.backgroundImage = to_bg_image(user_info.image_url))
    }

    static hide(){
        this.user_icon().remove();
    }
}

class EditForm extends Form{
    static title = "Edit User Profile"
    static btn_val = "Submit Changes"
    static needed_keys = ["username", "email"]
    static linker_map = () => {
        return {
            text: "Delete Account",
            listener: this.destroyer_listener
        }
    }

    static form_items = {
        "password":{
            "password_confirmation": "Confirm your Password",
            "password": "Your New Password (Or Retype Old Password)"
        } ,
        "text":{
            "image_url": "New Image URL!",
            "email": "Your Email!",
            "username": "Your Username!"
        }
    }

    static destroyer_listener(){
        fetch(users_url, reqObj("DELETE", null, getToken()))
        .then(values => {
            AuthenticatedScreen.redirect(Welcome.load)
        })
    }

    static data(event){ 
        const new_pass = event.target[3].value;
        const new_pass_conf = event.target[4].value
        return {
            users:{
                username: event.target[0].value,
                email: event.target[1].value,
                image_url: event.target[2].value,
                ...(new_pass!="" && {password: new_pass}),
                ...(new_pass_conf!="" && {password_confirmation: new_pass_conf})
            }
        }
    }

    static load_form_vals(errors){
        const form_keys = this.needed_keys
        for(const key of form_keys){
            const form_item = form.querySelector(`#${key}`)
            form_item.value = localStorage.getItem(key)
        }
    }

    static listener(){
        event.preventDefault();
        fetch(users_url, reqObj("PATCH",  EditForm.data(event), localStorage.getItem("token")))
        .then(resp => resp.json())
        .then(JSON => {
            if (!JSON.error){
                modal_form.style.display = "none";
                qs("#usr_img").style.backgroundImage = to_bg_image(JSON.image_url);
                localStorage.removeItem("username")
                localStorage.removeItem("email")
            }else{
                form.reset()
                EditForm.load_errors(JSON.error)
                EditForm.load_form_vals(Object.keys(JSON))
            }
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
                localStorage.setItem(key, user_info[key.toLowerCase()])
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