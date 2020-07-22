const qs = (item) => document.querySelector(item);
const ce = (item) => document.createElement(item);


const reqObj = (method, body_args) =>{
    let ret_Obj = {
        method: method, //patch, delete, post
        headers: {
            "Content-type":"application/json"
        }
    }

    if (body_args){
        ret_Obj["body"] = JSON.stringify(body_args)
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
