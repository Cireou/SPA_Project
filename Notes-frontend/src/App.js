const qs = (item) => document.querySelector(item);
const ce = (item) => document.createElement(item);

const block_1 = qs("#block-1");
const reqObj = (method, body_args, auth_token = null) =>{

    let ret_Obj = {
        method: method, //patch, delete, post
        headers: {
            "Content-type":"application/json",
            ...(auth_token && {"Authorization":auth_token})

        },
        ...(body_args && {"body": JSON.stringify(body_args)})
    }
    return ret_Obj;
}


// When the user clicks anywhere outside of the modal, close it
const modal_form = qs('#form-modal');
const modal_note = qs("#note-modal")
window.onclick = function(event) {
  if (event.target == modal_form) {
    modal_form.style.display = "none";
  } else if (event.target == modal_note){
    modal_note.style.display = 'none';
  } else if (event.target = qs(".sp-container") && qs(".sp-palette-toggle").innerText == "more"){
    New_Note_Modal.color_listener();
  }
}

const clear_Listener = (action, oldListener) => {
  if (!oldListener){
    return;
  }
  form.setAttribute("listener", false)
  form.removeEventListener(action, oldListener)
}

$("#colorpicker").spectrum({
  showPaletteOnly: true,
  togglePaletteOnly: true,
  togglePaletteMoreText: 'more',
  togglePaletteLessText: 'less',
  type: "color",
  allowEmpty: "false"
});

var rbg_array = (str) => {
  return [...str.matchAll(/\d{1,3}/g)].map(item => parseInt(item[0], 10))
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