openDocumentTypes();
const backofficeLanguages =  document.querySelector('input[name="languages"]').value.split(',');
let documentsData = {'order': {id: 1}, 'return': {id: 2}};

Object.keys(documentsData).forEach((key)=>{console.log(documentsData[key]);});

