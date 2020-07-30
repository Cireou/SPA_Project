//Basic Functions
const qs = (item) => document.querySelector(item);
const ce = (item) => document.createElement(item);

//Existing NAVBAR
const NAVBAR = qs("#nav-bar");
const HOME_BTN = qs("#home-btn")
const IMG_URL = "./Images/person-icon.png"

//Body
const block_1 = qs("#block-1");
const SIDEBAR = qs("#sidebar");
const SLIDESHOW = qs("#slideshow");
const AUTH_CONTAINER = qs("#authenticated-container");
const NO_SECTION_HTML = `<div id = "none-existing-container" class="w3-container" style=" padding-top: 5%; width: 100%; max-height: 50%; text-align: center">
                            <h2 class = "title"></h2>
                            <img class = "img" src="./Images/frown.png" alt="Notebook">
                            <h2 class = "footer"></h2>
                          </div>`

//Modals
const modal_form = qs('#form-modal');
const modal_note = qs("#note-modal")

//Token Retrieval
const getToken = () => localStorage.getItem("token");

const clearStorageExcept = (keep = []) => {
  let kept_keys = {}
  for(const exception_key of keep){
    let item = localStorage.getItem(exception_key)
    if (item){kept_keys[exception_key] = item;}
  }

  localStorage.clear()

  for(const kept_key in kept_keys){
    localStorage.setItem(kept_key, kept_keys[kept_key])
  }
}

const reqObj = (method, body_args, auth_token = null) =>{
    return {
        method: method, //patch, delete, post
        headers: {
            "Content-type":"application/json",
            ...(auth_token && {"Authorization":auth_token})

        },
        ...(body_args && {"body": JSON.stringify(body_args)})
    }
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal_form) {
    modal_form.style.display = "none";
  } else if (event.target == modal_note){
    modal_note.style.display = 'none';
  } 
}

const clear_Listener = (action, oldListener) => {
  if (!oldListener){
    return;
  }
  form.setAttribute("listener", false)
  form.removeEventListener(action, oldListener)
}

//Convert images to allow for background images:
const to_bg_image = (url) => {
  return `url("` + encodeURI(url) + '")'
}
//Color Functions
var rbg_array = (str) => [...str.matchAll(/\d{1,3}/g)].map(item => parseInt(item[0], 10))

const change_card_color = (args) => {
  const card = args.card;
  const new_color = args.color.toRgbString();
  card.style.backgroundColor = new_color;
  card.style.color = getContrast(new_color);
  [...card.parentElement.querySelectorAll(".card-cont")].forEach(item => {
    item.style.backgroundColor = new_color
    item.style.color = getContrast(new_color);
  })
}

var spectrum_map = (args) => {
  const caller_fn = (color) => {change_card_color({card: args.card, color: color})}
  return {
    color: args.color,
    showPaletteOnly: true,
    togglePaletteOnly: true,
    togglePaletteMoreText: 'more',
    togglePaletteLessText: 'less',
    type: "color",
    allowEmpty: "false",
    change: function(color){ caller_fn(color)},
    move: function(color){ caller_fn(color)},
  }
}
//Returns contrasting font color from a css tag.
var getContrast = function (css_str){
  const [r,g,b] = rbg_array(css_str)

	// Get YIQ ratio
	var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

	// Check contrast
	return (yiq >= 128) ? 'black' : 'white';
};

const add_opacity = (rbg_str, opacity = 0.6) => {
  const [r,g,b] = rbg_array(rbg_str)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

const invert = (rbg_str) => {
  const [r,g,b] = rbg_array(rbg_str)
  return `rgb(${255 - r}, ${255 - g}, ${255-b})`
}

