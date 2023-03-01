import * as languages from '../languages/languages';
import *  as fs from 'fs';
import { repoPath } from '../../extension';
import { documents } from '../documents/documents';

export const getAvailableLanguages = () => {
  return languages.availableLanguages;
};

export const getFilledLanguageData = (languagesList: string[]): any => {
  const data = languages.logiCommerceLanguages.filter(lang => languagesList.includes(lang.key));
  let lcDocuments = documents;
  data.forEach((lang: any) => {
    const filesLanguageDirectory = repoPath + '\\documentTemplates\\src\\' + lang.key.toLowerCase();
    const filenames = fs.readdirSync(filesLanguageDirectory);
    filenames.forEach((fileName: string, index: number) => {
      lcDocuments[fileName.replace('.twig', '')]['contents'][lang.id] = fs.readFileSync(filesLanguageDirectory + '\\' + fileName, "utf8");
    });
  });

  return lcDocuments;
};