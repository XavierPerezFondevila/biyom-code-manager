let controllerData: any = {};
import * as vscode from 'vscode';
import * as utils from '../utils/utils';

export function createController(data: any){
  controllerData = data;
  createFile();
}

function createFile() {

	// custom functions
	let controllerTemplate =
		`<?php

namespace SITE\\${controllerData.path.detail};

use FWK\\Core\\Controllers\\${controllerData.type.detail};
use FWK\\Core\\FilterInput\\FilterInputHandler;
use SDK\\Core\\Resources\\BatchRequests;`;

	controllerTemplate += setControllerCustomIncludesByType();
	controllerTemplate += `
/**
 * This is the ${controllerData.name} class.
 * This class extends ${controllerData.type.detail} (FWK\\Core\\Controllers\\${controllerData.type.detail}), see this class.
 *
 * @see ${controllerData.type.detail}
 *
 * @package SITE\\${controllerData.path.detail}
 */
class ${controllerData.name}Controller extends ${controllerData.type.detail} {

    /**
     * 
     * {@inheritDoc}
     * 
     * @see \\FWK\\Core\\Controllers\\Controller::getFilterParams()
     */
    protected function getFilterParams(): array {
        return [];
    }

    /**
     * 
     * {@inheritDoc}
     * 
     * @see \\FWK\\Core\\Controllers\\Controller::getOriginParams()
     */
    protected function getOriginParams() {
        return FilterInputHandler::PARAMS_FROM_GET;
    }`;

	controllerTemplate += setControllerCustomMethodsByType();

	controllerTemplate += `
    /**
     * 
     * {@inheritDoc}
     * 
     * @see \\FWK\\Core\\Controllers\\Controller::setControllerBaseBatchData()
     */
    final protected function setControllerBaseBatchData(BatchRequests $requests): void {
    }

    /**
     * 
     * {@inheritDoc}
     * 
     * @see \\FWK\\Core\\Controllers\\Controller::setBatchData()
     */
    protected function setBatchData(BatchRequests $request): void {
    }

    /**
     * 
     * {@inheritDoc}
     * 
     * @see \\FWK\\Core\\Controllers\\Controller::setData()
     */
    protected function setData(array $additionalData = []): void {
    }
}
`;
	utils.customWriteFile(controllerData.repoPath + `\\src\\${controllerData.path.detail}`, `${controllerData.name}Controller.php`, controllerTemplate);
	vscode.commands.executeCommand('vscode.open', vscode.Uri.file(controllerData.repoPath + `\\src\\${controllerData.path.detail}\\${controllerData.name}Controller.php`));
	if (controllerData.type.detail === 'BaseHtmlController') {
		let htmlDefaultFile = `{%- block content -%}\n{%- endblock content -%}`;
		utils.customWriteFile(controllerData.repoPath + `\\themes\\default\\Responsive\\Content\\${controllerData.path.label}\\Internal\\${controllerData.name}`, 'default.html.twig', htmlDefaultFile);
	}

}

function setControllerCustomIncludesByType() {
	const customIncludes: any = {
		'BaseJsonController': `
use SDK\\Core\\Dtos\\Element;
`,
		'BaseJsController': `
use SDK\\Core\\Dtos\\Element;
`
	}
	return typeof customIncludes[controllerData.type.detail] !== 'undefined' ? customIncludes[controllerData.type.detail] : '';
}

function setControllerCustomMethodsByType() {
	const getResponseDataCode = `
    
    /**
     * 
     * {@inheritDoc}
     * 
     * @see \\FWK\\Core\\Controllers\\BaseJsonController::getResponseData()
     */
    protected function getResponseData(): ?Element {
        return new class() extends Element {
            private ?array $responseData = [];

            public function __construct() {
            }

            public function jsonSerialize(): mixed {
                return $this->responseData;
            }
        };
    }
`;
	const customMethods: any = {
		'BaseJsonController': getResponseDataCode
	};

	return typeof customMethods[controllerData.type.detail] !== 'undefined' ? customMethods[controllerData.type.detail] : '';

}