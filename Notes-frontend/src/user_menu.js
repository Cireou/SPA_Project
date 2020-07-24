class UserMenu{
    static create(redirector_class){
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
                redirector_class.redirect(Welcome.load);
            }
    }
}