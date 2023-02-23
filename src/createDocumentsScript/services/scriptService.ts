export const getScript = (documentsData: any) => `
  openDocumentTypes();
  let documentsData = ${JSON.stringify(documentsData)};
  Object.keys(documentsData).forEach((key)=>{console.log(documentsData[key]);});
`;