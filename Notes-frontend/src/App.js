const qs = (item) => document.querySelector(item);
const ce = (item) => document.createElement(item);


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
const modal = qs('#form-modal');
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

const clear_Listener = (action, oldListener) => {
  if (!oldListener){
    return;
  }
  form.setAttribute("listener", false)
  form.removeEventListener(action, oldListener)
}
