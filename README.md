# Code manager

This is the "biyom-code-manager" a giga-chad extension intended for saving your time while coding.

## Features

- To create an internal controller (`Ctrl+Shift+P`) and type `create internal`.

- Create a script that generates the backoffice documents (`Ctrl+Shift+P`) and type `create document script`.

- Create a script that imports the backoffice documents (`Ctrl+Shift+P`) and type `import document script`.

- Create DynamicCustomForms structure (`Ctrl+Shift+P`) and type `import dynamic forms`.

- Import any library in TrilogiDev git  (`Ctrl+Shift+P`) and type `import library`.

- Check missing or deprecated SITE LanguageLabels compared FWK (`Ctrl+Shift+P`) and type `checkLanguageLabels`.

## Requirements

- Your VScode workspace must have repo-xx folder.
- Internal controller name must be camel cased.
- Your `settings.json` file must have these config variables:
  - `biyom-code-manager.accessToken`
  - `biyom-code-manager.availableFolders`
  - `biyom-code-manager.topics`
  - `biyom-code-manager.mailId`
 
    
  ![settings](https://github.com/XavierPerezFondevila/biyom-code-manager/blob/master/images/biyom-code-manager-settings.png)

## Known Issues

Some mutation observers may not be cleared at all in `Import Document Script` and `create document script` commands, refresh the page to make sure they are removed :P

## Release Notes

## 1.5.7 - 11/12/2024
- Add cc to dynamic mails
- Fix "Utils" path in create internal controller feature

## 1.5.6 - 05/02/2024
- Fix Mails script generation
- Update dynamic forms (v1.0.1)

### 1.5.5
- Fix LC mail not found tab error

### 1.5.4
- New tree view organization

### 1.5.3
- New action "Create LC mails script"

### 1.5.2
- New action "Check SITE LanguageLabels status"

### 1.5.1
- Fix `import dynamic forms` bugs. 

### 1.5.0
- Add auxiliar tab for more user friendly extension commands use. 

### 1.4.0
- New feature `import library` 
- Fix `Import Document Script` and code updates 

### 1.3.0
- New feature `Import Dynamic Forms`

### 1.2.0
- New feature `Import Document Script`
### 1.1.2
- Rename 'RMA' to 'Refund request' to fix document scripts
### 1.1.1
#### Create internal controller
- Fix InternalFiles content replacement
- Add JS and XML Controllers

### 1.1.0

- New feature `create document script`

### 1.0.1

- Adapting JS extension to TS

- File code snippets formatted in spaces size 4

### 1.0.0

Initial release of the extension.

**Enjoy!**
