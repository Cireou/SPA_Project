const users_url = "http://localhost:3000/users"
const auth_url = "http://localhost:3000/authenticate"

const form = qs("#intro-form")
const form_inputs = form.querySelector("#inputs")
const nav_modal = qs("#form-modal")

class Form{

    static generate_form_input(label, placeholder, form_type){
        let p = ce("p");
            let p_label = ce("label");
            p_label.innerText = label.split("_").map(text_str => text_str[0].toUpperCase() + text_str.slice(1)).join(" ");
        p.append(p_label)

        let input = ce("input");
        input.id = label
        input.className= "w3-input w3-border";
        input.type = form_type;
        input.placeholder = placeholder;

        form_inputs.prepend(p, input)
    }

    static load(title, form_items, linker_map, btn_val, listener = null){
        nav_modal.style.display="block"

        const form_title = qs("#form-title")
        form_title.innerText = title

        form_inputs.innerText = ""
        for (let input_type in form_items){
            for(let input_label in form_items[input_type]){
                this.generate_form_input(input_label, form_items[input_type][input_label], input_type)
            }
        }
        
        const linker = qs("#linker");
        linker.innerText = linker_map.text;
        linker.addEventListener("click", () => {(linker_map.listener) ? linker_map.listener() : false;})

        const submit_btn = qs("#submit-btn")
        submit_btn.value = btn_val;


        if (!form.getAttribute('listener')){
            form.setAttribute("listener", true)
        } else{
            clear_Listener("submit", listener)
        }
        // !form.getAttribute('listener') ? form.setAttribute("listener", true): form.removeEventListener();
    }
    static reset(){
        for (const form_item of form.querySelectorAll("input:not([type='submit'])")){
            $(`#${form_item.id}`).removeClass("error-text")
            form_item.style.backgroundColor = "white";
            form_item.style.color = "black";
            form_item.placeholder = this.form_items[form_item.type][form_item.id]
        }
    }

    static load_errors(error_map){
        for(const error in error_map){
            const form_item = qs(`#${error}`)
            $(`#${error}`).addClass("error-text")
            form_item.style.backgroundColor = "red";
            form_item.style.color = "white";
            const error_arr = error_map[error]
            form_item.placeholder = error_arr[error_arr.length - 1][0].toUpperCase() + error_arr[error_arr.length - 1].slice(1) +  "."
        }
    }
}

class Signup_Form extends Form{
    static navbar_btn = qs("#signup-btn")
    static linker_map = () => {return { 
        text: "Already Have an Account?",
        listener: Login_Form.load
    }}

    static title = "Signup"
    static btn_val = "Create Account"

    static form_items = {
        "password":{
            "password_confirmation": "Confirm your Password",
            "password": "Your New Password"
        } ,
        "text":{
            "email": "Your Email!",
            "username": "Your Username"
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
                    Welcome.redirect(AuthenticatedScreen.load);
                } else {
                    form.reset()
                    Signup_Form.reset()
                    Signup_Form.load_errors(token)
                } 
            })
    
    }
    static load(){
        Form.load(Signup_Form.title, Signup_Form.form_items, Signup_Form.linker_map(), 
            Signup_Form.btn_val, Login_Form.listener);
        form.addEventListener("submit", Signup_Form.listener)
    }
}

class Login_Form extends Form{
    static navbar_btn = qs("#login-btn")
    static title = "Sign In"
    static btn_val = "Sign in!"
    static linker_map = () => {return { 
        text: "Don't Have an Account Yet?",
        listener: Signup_Form.load
    }}

    static form_items = {
        "password":{
            "password": "Your Password"
        } ,
        "text":{
            "email": "Your Email!"
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
                    Welcome.redirect(AuthenticatedScreen.load);
                } else {
                    form.reset();
                    Login_Form.reset();
                    Login_Form.load_errors({email: ["Incorrect email or email not registered"], password: ["Incorrect password or account not registered"]})
                } 
            })
    }

    static load(){
        Form.load(Login_Form.title, Login_Form.form_items, Login_Form.linker_map(),
            Login_Form.btn_val, Signup_Form.listener);
        form.addEventListener("submit", Login_Form.listener)
    }
}

class Slideshow{
    constructor(class_name){
        this.class_name = class_name;
        this.current = 0;
        this.timer = null;
    }
    load(){
        SLIDESHOW.style.display = "block"
        var slides = [...document.getElementsByClassName(this.class_name)];
        slides.forEach(slide => slide.style.display = "none");
        this.current += 1;
        if (this.current > slides.length){this.current = 1}
        slides[this.current - 1].style.display = "block";
        this.timer = setTimeout(this.load.bind(this), 3000);
    }
    hide(){
        SLIDESHOW.style.display = "none"
        clearTimeout(this.timer);
    }
}

class Welcome {
    static slideshow =  new Slideshow("mySlides")
    static load(){
        localStorage.clear();
        qs("#signup-btn").style.display= "block"
        qs("#login-btn").style.display= "block"

        Welcome.slideshow.load();
    }
    static hide(){
        qs("#form-modal").style.display='none'
        qs("#signup-btn").style.display='none'
        qs("#login-btn").style.display='none'
        Welcome.slideshow.hide();
    }

    static redirect(redirect_fn){
        this.hide();
        redirect_fn();
    }
}

Welcome.load();