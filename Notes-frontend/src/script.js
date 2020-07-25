var toolbarOptions = [
  [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],        
  [{ 'align': [] }],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],     
  [{ 'indent': '-1'}, { 'indent': '+1' }],        
  [{ 'color': [] }, { 'background': [] }],         
  ['link', 'image', 'video', 'formula', 'code-block'],

];

const load_editor = () => {
  var quill = new Quill('#editor-container', {
      modules: {
          toolbar: toolbarOptions
      },
      placeholder: '...',
      theme: 'snow'  // or 'bubble'
  })
  return quill
}
