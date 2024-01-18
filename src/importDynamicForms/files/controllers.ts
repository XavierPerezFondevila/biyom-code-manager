const dynamicCustomForms = `<?php

declare(strict_types=1);

namespace SITE\\Core\\Controllers\\DynamicCustomForms;

use FWK\\Core\\Form\\Elements\\Inputs\\InputHidden;
use FWK\\Core\\Form\\FormItem;
use FWK\\Enums\\Parameters;
use SITE\\Enums\\DynamicCustomForms\\CustomForm;
use SITE\\Enums\\DynamicCustomForms\\CustomFormItem;
use SITE\\Enums\\LanguageLabels;

/**
 * This is the DynamicCustomForms class. 
 * It contains custom form fields based on array parameters and the logic to transform those fields into html inputs
 *
 * @version 1.0.1
 * @author xaviperez
 * 
 * @package SITE\\Core\\Controllers\\DynamicCustomForms
 */
class DynamicCustomForms {
    private const CUSTOM_FORMS = [
        // 'exampleForm' => [
        //     CustomForm::TYPE => 'exampleForm',
        //     CustomForm::ITEMS => [
        //         Parameters::NAME => [CustomForm::INPUT => CustomForm::INPUT_TEXT, CustomFormItem::SET_LABEL_FOR => LanguageLabels::NAME, CustomFormItem::SET_REQUIRED => true],
        //         Parameters::LAST_NAME => [CustomForm::INPUT => CustomForm::INPUT_TEXT, CustomFormItem::SET_LABEL_FOR => LanguageLabels::LAST_NAME, CustomFormItem::SET_REQUIRED => true],
        //         Parameters::EMAIL => [CustomForm::INPUT => CustomForm::INPUT_TEXT, CustomFormItem::SET_LABEL_FOR => LanguageLabels::EMAIL, CustomFormItem::SET_REQUIRED => true],
        //         Parameters::ADDRESS => [CustomForm::INPUT => CustomForm::INPUT_TEXT, CustomFormItem::SET_LABEL_FOR => LanguageLabels::ADDRESS, CustomFormItem::SET_REQUIRED => true],
        //     ]
        // ],
    ];

    private array $formFields = [];

    /**
     * DynamicCustomForms constructor.
     */
    function __construct() {
        $this->setFormFields();
    }

    /**
     * Get the form fields.
     *
     * @return array The form fields.
     */
    public function getFormFields(): array {
        return $this->formFields;
    }

    /**
     * Set the form fields.
     */
    private function setFormFields(): void {
        $forms = self::CUSTOM_FORMS;

        foreach ($forms as $formData) {
            $fields = [];
            $type = $formData[CustomForm::TYPE];

            $fields[] = new FormItem(Parameters::TYPE, (new InputHidden($type))->setId('sendMailTypeField_' . $type));
            foreach ($formData[CustomForm::ITEMS] as $key => $field) {
                $fields[] = (new DynamicFormItem($key, $field))->getFormItem();
            }
            $this->formFields[$type] = $fields;
        }
    }
}
`;

const dynamicCustomMail = `<?php

declare(strict_types=1);

namespace SITE\\Core\\Controllers\\DynamicCustomForms;

use Exception;
use FWK\\Core\\Exceptions\\CommerceException;
use FWK\\Core\\Resources\\Language;
use FWK\\Enums\\Parameters;
use SDK\\Application;
use SITE\\Enums\\DynamicCustomForms\\CustomMailParameters;
use SITE\\Enums\\LanguageLabels;

/**
 * This is the DynamicCustomMail class. It contains the logic for creating the custom mail structure based on array parameters.
 *
 * @version 1.0.1
 * @author xaviperez
 *
 * @package SITE\\Core\\Controllers\\DynamicCustomForms
 */
class DynamicCustomMail {

    /**
     * Prefix we use to search for language labels constant 
     * 
     * @see LanguageLabels
     * 
     * @package SITE\\Enums\\DynamicModules
     */
    private const ID_PREFIX = 'sendMail';

    /**
     * Custom mails paramaters declarations 
     */
    private const CUSTOM_MAILS = [
        // "exampleForm" => [
        //     CustomMailParameters::TO_EMAIL => 'client.email.destinatario@empresa.com',
        //     CustomMailParameters::SUBJECT => LanguageLabels::BUY_BUNDLE_TITLE,
        //     CustomMailParameters::DYNAMIC_TO_EMAIL => [
        //         CustomMailParameters::TO_EMAIL_PARAMETER => 'selectMotives',
        //         CustomMailParameters::TO_EMAIL_ENUM_CLASS_PARAMETER => Mails::class
        //     ]
        // ],
    ];

    private const LOGO_WIDTH = '210';

    private ?Language $languageSheet = null;

    private string $currentMail = '';

    private ?string $mailTo = null;

    private string $mailSubject = '';

    private array $mailParameters = [];

    private bool $mailLogo = false;

    /**
     * DynamicCustomMail constructor.
     *
     * @param array $parameters The array of parameters for the custom mail.
     *
     * @throws CommerceException If the mail is not found in the custom mails declaration.
     */
    function __construct(array $parameters) {
        if (!array_key_exists($parameters[Parameters::TYPE], self::CUSTOM_MAILS)) {
            throw new CommerceException("Mail not found in custom mails declaration");
        }
        $this->languageSheet = Language::getInstance();
        $this->mailParameters = $parameters;
        $this->currentMail = $this->mailParameters[Parameters::TYPE];
        $this->setMailTo();
        $this->setMailSubject();
    }

    /**
     * Get the recipient email address for the mail.
     *
     * @return string The email address.
     */
    public function getMailTo(): string {
        return $this->mailTo;
    }

    /**
     * Returns current mail parameter
     *
     * @return string
     */
    public function getCurrentMail(): string {
        return $this->currentMail;
    }

    /**
     * Get the subject of the mail.
     *
     * @return string The mail subject.
     */
    public function getMailSubject(): string {
        return $this->mailSubject;
    }

    /**
     * Get the body of the mail.
     *
     * @return string The mail body.
     */
    public function getMailBody(): string {
        return $this->setMailBody();
    }

    /**
     * Set whether the mail has a logo.
     *
     * @param bool $hasLogo Whether the mail has a logo.
     */
    public function setMailLogo(bool $hasLogo): void {
        $this->mailLogo = $hasLogo;
    }

    /**
     * Set the recipient email address for the mail.
     *
     * @throws CommerceException If the "To" parameter is not found.
     */
    private function setMailTo(): void {
        if (array_key_exists(CustomMailParameters::DYNAMIC_TO_EMAIL, self::CUSTOM_MAILS[$this->currentMail])) {
            $dynamicToEmail = self::CUSTOM_MAILS[$this->currentMail][CustomMailParameters::DYNAMIC_TO_EMAIL];
            if (!empty($dynamicToEmail)) {
                $dynamicMailKey = $this->mailParameters[$dynamicToEmail[CustomMailParameters::TO_EMAIL_PARAMETER]];
                $enumKey = implode('_', array_map('strtoupper', preg_split('/(?=[A-Z])/', $dynamicMailKey)));
                $this->mailTo = (new \\ReflectionClassConstant(self::CUSTOM_MAILS[$this->currentMail][CustomMailParameters::DYNAMIC_TO_EMAIL][CustomMailParameters::TO_EMAIL_ENUM_CLASS_PARAMETER], $enumKey))->getValue();
            }
        }

        if (array_key_exists(CustomMailParameters::TO_EMAIL, self::CUSTOM_MAILS[$this->currentMail])) {
            $this->mailTo = self::CUSTOM_MAILS[$this->currentMail][CustomMailParameters::TO_EMAIL];
        }

        if (is_null($this->mailTo)) {
            throw new CommerceException("To Parameter is required");
        }
    }

    /**
     * Set the subject of the mail.
     *
     * @throws CommerceException If the "Subject" parameter is not found.
     */
    private function setMailSubject(): void {
        if (!array_key_exists(CustomMailParameters::SUBJECT, self::CUSTOM_MAILS[$this->currentMail])) {
            throw new CommerceException("Subject parameter is required");
        }

        $this->mailSubject = $this->languageSheet->getLabelValue(self::CUSTOM_MAILS[$this->currentMail][CustomMailParameters::SUBJECT]);
    }

    /**
     * Generate the body of the mail.
     *
     * @return string The mail body.
     */
    private function setMailBody(): string {
        $keysToExclude = [Parameters::TYPE, Parameters::PATH, Parameters::ATTACHMENTS];
        $filteredArray = array_diff_key($this->mailParameters, array_flip($keysToExclude));

        $mailBody = '<table style="width: 100%; max-width: 400px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; vertical-align: middle; border-collapse: collapse;">';

        if ($this->mailLogo) {
            // email logo path has to be the same as emilio generator!
            $mailLogo = Application::getInstance()->getEcommerceSettings()->getGeneralSettings()->getCdnImages() . '/logoemails.jpg';
            $mailBody .= '<caption style="margin-bottom: 100px;"><img src="' . $mailLogo . '" width=' . self::LOGO_WIDTH . ' /></caption>';
        }

        foreach ($filteredArray as $languageKey => $value) {
            // if the value comes from selectOption we get the label of the selectedOption
            if ((is_int(strpos($languageKey, 'select')) && strpos($languageKey, 'select') === 0) || is_int(strpos($languageKey, 'radio')) && strpos($languageKey, 'radio') === 0) {
                $value = $this->getLabelValue($value);
            }

            // Trying to search label like 'sendMailName'
            // If not found we enter into the catch statement for trying to find label like 'name'
            $auxLanguageKey = self::ID_PREFIX . ucfirst($languageKey);
            $label = null;
            try {
                $label = $this->getLabelValue($auxLanguageKey);
            } catch (Exception $e) {
                $label = $this->getLabelValue($languageKey);
            }
            $mailBody .= '<tr><td style="padding: 16px 20px; border-bottom: 1px solid #dcdcdc;"><b>' . $label . '</b></td><td style="padding: 16px 20px; border-bottom: 1px solid #dcdcdc;">' . $value . '</td></tr>';
        }
        $mailBody .= '</table>';
        return $mailBody;
    }

    /**
     * Get the label value for a given language key.
     *
     * @param string $languageKey The language key.
     *
     * @return string The label value.
     */
    private function getLabelValue(string $languageKey): string {
        $key = implode('_', array_map('strtoupper', preg_split('/(?=[A-Z])/', $languageKey)));
        $label = (new \\ReflectionClassConstant(LanguageLabels::class, strtoupper($key)))->getValue();
        return $this->languageSheet->getLabelValue($label);
    }
}
`;

const dynamicFromItem = `<?php

declare(strict_types=1);

namespace SITE\\Core\\Controllers\\DynamicCustomForms;

use FWK\\Core\\Exceptions\\CommerceException;
use FWK\\Core\\Form\\Elements\\Element;
use FWK\\Core\\Form\\Elements\\Inputs\\InputCheckbox;
use FWK\\Core\\Form\\Elements\\Inputs\\InputEmail;
use FWK\\Core\\Form\\Elements\\Inputs\\InputFile;
use FWK\\Core\\Form\\Elements\\Inputs\\InputHidden;
use FWK\\Core\\Form\\Elements\\Inputs\\InputNumber;
use FWK\\Core\\Form\\Elements\\Inputs\\InputRadio;
use FWK\\Core\\Form\\Elements\\Inputs\\InputText;
use FWK\\Core\\Form\\Elements\\Option;
use FWK\\Core\\Form\\Elements\\Select;
use FWK\\Core\\Form\\Elements\\Separator;
use FWK\\Core\\Form\\Elements\\Textarea;
use FWK\\Core\\Form\\FormItem;
use FWK\\Core\\Resources\\Language;
use SITE\\Enums\\DynamicCustomForms\\CustomForm;
use SITE\\Enums\\DynamicCustomForms\\CustomFormItem;
use SITE\\Enums\\LanguageLabels;

/**
 * This is the DynamicFormItem class.
 *
 * @version 1.0.1
 * @author xaviperez
 * 
 * @package SITE\\Core\\Controllers\\DynamicCustomForms
 */
class DynamicFormItem {

    private const ID_PREFIX = 'sendMail';

    private const DEFAULT_ITEM_CLASS = 'form-control';

    private const NON_CLASS_ITEMS = [CustomForm::INPUT_RADIO, CustomForm::SELECTOR];

    private const EXCLUDED_CONFIGURATION_KEYS = [CustomForm::INPUT, CustomForm::SELECTOR_OPTIONS, CustomForm::RADIO_OPTIONS];

    private ?Element $formElement = null;

    private ?Language $languageSheet = null;

    private string $fieldName = '';

    private array $config = [];

    /**
     * Constructor.
     *
     * @param string $fieldName The field name.
     * @param array $config The configuration array.
     */
    public function __construct(string $fieldName, array $config) {
        $this->languageSheet = Language::getInstance();
        $this->config = $config;
        $this->fieldName = $fieldName;
        $this->setFormElement();
        $this->setItemValues();
    }

    /**
     * Get the form item.
     *
     * @return FormItem The form item.
     */
    public function getFormItem(): FormItem {
        return new FormItem($this->fieldName, $this->formElement);
    }

    /**
     * Get the select options.
     *
     * @param array $selectOptions The select options.
     * @return array The options array.
     */
    private function getSelectOptions(array $selectOptions): array {
        $options = [
            (new Option($this->languageSheet->getLabelValue(LanguageLabels::LOCATION_SELECT_AN_OPTION)))->setDisabled(true)
        ];
        foreach ($selectOptions as $item) {
            $key = implode('_', array_map('strtoupper', preg_split('/(?=[A-Z])/', $item)));
            $label = (new \\ReflectionClassConstant(LanguageLabels::class, $key))->getValue();
            $options[] = (new Option($this->languageSheet->getLabelValue($label)))->setValue($item); //setData->JSON lc-data
        }
        return $options;
    }

    /**
     * Get the radio options.
     *
     * @param array $radioOptions The radio options.
     * @return array The options array.
     */
    private function getRadioOptions(array $radioOptions): array {
        $values = [];
        foreach ($radioOptions as $item) {
            $key = implode('_', array_map('strtoupper', preg_split('/(?=[A-Z])/', $item)));
            $label = (new \\ReflectionClassConstant(LanguageLabels::class, $key))->getValue();
            $values = $values + [$item => $this->languageSheet->getLabelValue($label)];
        }

        return $values;
    }

    /**
     * Set the values of the form item.
     */
    private function setItemValues(): void {
        $this->formElement->setId(self::ID_PREFIX . ucfirst($this->fieldName));
        $filteredArray = array_diff_key($this->config, array_flip(self::EXCLUDED_CONFIGURATION_KEYS));

        if (!in_array($this->config[CustomForm::INPUT], self::NON_CLASS_ITEMS) && !array_key_exists(CustomFormItem::SET_CLASS, $filteredArray)) {
            $filteredArray[CustomFormItem::SET_CLASS] = self::DEFAULT_ITEM_CLASS;
        }

        foreach ($filteredArray as $functionKey => $value) {
            if ($functionKey === CustomFormItem::SET_LABEL_FOR) {
                $value = $this->languageSheet->getLabelValue($value);
            }
            $this->formElement->$functionKey($value);
        }
    }

    /**
     * Set the form element.
     */
    private function setFormElement(): void {
        $element = $this->config[CustomForm::INPUT];
        switch ($element) {
            case CustomForm::INPUT_TEXT:
                $this->formElement = new InputText();
                break;
            case CustomForm::INPUT_NUMBER:
                $this->formElement = new InputNumber();
                break;
            case CustomForm::INPUT_EMAIL:
                $this->formElement = new InputEmail();
                break;
            case CustomForm::INPUT_RADIO:
                $this->formElement = new InputRadio($this->getRadioOptions((new \\ReflectionClass($this->config[CustomForm::RADIO_OPTIONS]))->getConstants()));
                break;
            case CustomForm::INPUT_CHECKBOX:
                $this->formElement = new InputCheckbox();
                break;
            case CustomForm::INPUT_HIDDEN:
                $this->formElement = new InputHidden();
                break;
            case CustomForm::SELECTOR:
                if (!array_key_exists(CustomForm::SELECTOR_OPTIONS, $this->config)) {
                    throw new CommerceException("Form Element '$element' must have the option key");
                }
                $this->formElement = new Select($this->getSelectOptions((new \\ReflectionClass($this->config[CustomForm::SELECTOR_OPTIONS]))->getConstants()));
                break;
            case CustomForm::TEXTAREA:
                $this->formElement = new Textarea();
                break;
            case CustomForm::INPUT_ATTACHMENT:
                $this->formElement = new InputFile();
                break;
            case CustomForm::SEPARATOR:
                if (!array_key_exists(CustomFormItem::SET_VALUE, $this->config)) {
                    throw new CommerceException("Form Element '$element' must have value");
                }
                $this->formElement = new Separator();
                break;
            default:
                throw new CommerceException("Form Element '$element': isn't accepted");
                break;
        }
    }
}
`;

const sendMailController = `<?php

namespace SITE\\Controllers\\Resources\\Internal;

use FWK\\Controllers\\Resources\\Internal\\SendMailController as FWKSendMailController;
use SDK\\Core\\Resources\\Environment;
use SDK\\Dtos\\Common\\Route;
use SITE\\Core\\Controllers\\DynamicCustomForms\\DynamicCustomMail;
use SITE\\Enums\\LanguageLabels;

/**
 * This is the Related Items controller.
 * This class extends sendMailController (FWK\\Controllers\\Resources\\Internal\\SendMailController), see this class.
 *
 * @see sendMailController
 *
 * @package SITE\\Controllers\\Resources\\Internal
 */
class SendMailController extends FWKSendMailController {

    private ?DynamicCustomMail $dynamicCustomMails = null;

    function __construct(Route $route) {
        parent::__construct($route);
        $this->dynamicCustomMails = new DynamicCustomMail($this->getRequestParams());

        // Set custom error/succes messages by current mail id
        // if ($this->dynamicCustomMails->getCurrentMail() === 'budgetRequestForm') {
        //     $this->responseMessage = $this->language->getLabelValue(LanguageLabels::SEND_MAIL_SUCCESS_BUDGET_FORM, $this->responseMessage);
        //     $this->responseMessageError = $this->language->getLabelValue(LanguageLabels::SEND_MAIL_ERROR_BUDGET_FORM, $this->responseMessageError);
        // }
    }

    protected function getTo(): string {
        if (Environment::get('DEVEL')) {
            return 'your.email@trilogi.com';
        }

        return $this->dynamicCustomMails->getMailTo();
    }

    protected function getSubject(): string {
        return $this->dynamicCustomMails->getMailSubject();
    }

    protected function getBody(): string {
        $this->dynamicCustomMails->setMailLogo(true);
        return $this->dynamicCustomMails->getMailBody();
    }

    /** 
     * 
     * {@inheritDoc}
     * 
     * @see \\FWK\\Core\\Controllers\\Controller::initializeAppliedParameters()
     */
    protected function initializeAppliedParameters(): void {
        parent::initializeAppliedParameters();

        // true o false para habilitar o deshabilitar el uso de stripTags a nivel de todos los parámetros del ParametersGroup
        $this->customFormSendMailParametersGroup->setFormattedDataOutputWithStripTags(false);

        // Si el anterior está a true, se le puede decir que no ejecute el stripTags sobre un "array" de parámetros del ParametersGroup
        // $this->customFormSendMailParametersGroup->setFormattedDataOutputWithStripTagsExceptions([Parameters::BODY]);
    }
}
`;


export const controllers = [
  {
    name: 'DynamicCustomForms.php',
    path: '\\src\\Core\\Controllers\\DynamicCustomForms',
    content: dynamicCustomForms
  },
  {
    name: 'DynamicCustomMail.php',
    path: '\\src\\Core\\Controllers\\DynamicCustomForms',
    content: dynamicCustomMail
  },
  {
    name: 'DynamicFormItem.php',
    path: '\\src\\Core\\Controllers\\DynamicCustomForms',
    content: dynamicFromItem
  },
  {
    name: 'SendMailController.php',
    path: '\\src\\Controllers\\Resources\\Internal',
    content: sendMailController
  },
];