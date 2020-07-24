const users_url = "http://localhost:3000/users"
const auth_url = "http://localhost:3000/authenticate"

const form = qs("#intro-form")
const form_inputs = form.querySelector("#inputs")
const nav_modal = qs("#form-modal")

class Form{

    static generate_form_input(label, placeholder, form_type){
        let p = ce("p");
            let p_label = ce("label");
            p_label.innerText = label;
        p.append(p_label)

        let input = ce("input");
        input.id = label
        input.className= "w3-input w3-border";
        input.type = form_type;
        input.placeholder = placeholder;
        

        form_inputs.prepend(p, input)
    }

    static load(title, form_items, btn_val, listener = null){
        nav_modal.style.display="block"

        const form_title = qs("#form-title")
        form_title.innerText = title

        form_inputs.innerText = ""
        for (let input_type in form_items){
            for(let input_label in form_items[input_type]){
                this.generate_form_input(input_label, form_items[input_type][input_label], input_type)
            }
        }
        
        const submit_btn = qs("#submit-btn")
        submit_btn.value = btn_val;


        if (!form.getAttribute('listener')){
            form.setAttribute("listener", true)
        } else{
            clear_Listener("submit", listener)
        }
        // !form.getAttribute('listener') ? form.setAttribute("listener", true): form.removeEventListener();
    }
}

class Signup_Form extends Form{
    static navbar_btn = qs("#signup-btn")

    static title = "Signup"
    static btn_val = "Create Account"

    static form_items = {
        "password":{
            "Password Confirmation": "Confirm your Password",
            "Password": "Your New Password"
        } ,
        "text":{
            "Email": "Your Email!",
            "Username": "Your Username"
        }
    }

    static data(event){
        return {
            users:{
                username: event.target[0].value,
                email: event.target[1].value,
                password: event.target[2].value,
                password_confirmation: event.target[3].value
            }
        }
    }
    static listener(){
        event.preventDefault();
            fetch(users_url, reqObj("POST",  Signup_Form.data(event)))
            .then(resp => resp.json())
            .then(token => {
                const auth_token = token["auth_token"]
                if (auth_token){
                    localStorage.setItem('token', auth_token);
                    clear_Listener("submit", Signup_Form.listener);
                    Welcome.redirect(Home.load);
                } else {
                    console.log("Signup")
                    form.reset()
                } 
            })
    }
    static load(){
        Form.load(this.title, this.form_items, this.btn_val, Login_Form.listener);
        form.addEventListener("submit", this.listener)
    }
}

class Login_Form extends Form{
    static navbar_btn = qs("#login-btn")
    static title = "Sign In"
    static btn_val = "Sign in!"

    static form_items = {
        "password":{
            "Password": "Your Password"
        } ,
        "text":{
            "Email": "Your Email!"
        }
    }

    static data(event){ 
        return {
            email: event.target[0].value,
            password: event.target[1].value
        }
    }

    static listener(){
        event.preventDefault();
            fetch(auth_url, reqObj("POST", Login_Form.data(event)))
            .then(resp => resp.json())
            .then(token => {
                const auth_token = token["auth_token"]
                if (auth_token){
                    localStorage.setItem('token', auth_token);
                    clear_Listener("submit", Login_Form.listener);
                    Welcome.redirect(Home.load);
                } else {
                    console.log("Login")
                    form.reset();
                } 
            })
    }

    static load(){
        Form.load(this.title, this.form_items, this.btn_val, Signup_Form.listener);
        form.addEventListener("submit", this.listener)
    }
}

class Welcome {
    static load(){
        qs("#signup-btn").style.display= "block"
        qs("#login-btn").style.display= "block"
    }
    static hide(){
        qs("#form-modal").style.display='none'
        qs("#signup-btn").style.display='none'
        qs("#login-btn").style.display='none'
    }

    static redirect(redirect_fn){
        this.hide();
        redirect_fn();
    }
}
