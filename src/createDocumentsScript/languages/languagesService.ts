import * as languages from './languages';
import *  as fs from 'fs';
import { repoPath } from '../../extension';
import { documents } from '../documents/documents';

export const getAvailableLanguages = () => {
  return languages.availableLanguages;
};

export const getFilledLanguageData = (languagesList: string[]): any => {
  const data = languages.logiCommerceLanguages.filter(lang => languagesList.includes(lang.key));
  return data.map((lang: any)=>{
    let filesLanguageDirectory = repoPath + '\\documentTemplates\\src\\' + lang.key.toLowerCase();
    let filenames = fs.readdirSync(filesLanguageDirectory);
    filenames.forEach((fileName: string) => {
      lang['document'] = {
        'content' : fs.readFileSync(filesLanguageDirectory + '\\' + fileName, "utf8"),
        'documentId': documents[fileName.replace('.twig', '')]?.id
      };
    });
    return lang;
  });
  
};