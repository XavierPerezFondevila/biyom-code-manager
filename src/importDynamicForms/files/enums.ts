const customFormPhp = `<?php

declare(strict_types=1);

namespace SITE\\Enums\\DynamicCustomForms;

use SDK\\Core\\Enums\\Enum;

/**
 * This is the CustomForm enumeration class.
 *
 * @see Enum
 *
 * @package SITE/Enums/DynamicCustomForms
 */
abstract class CustomForm extends Enum {

    public const TYPE = 'type';

    public const ITEMS = 'items';

    public const INPUT = 'input';

    public const INPUT_TEXT = 'inputText';

    public const INPUT_NUMBER = 'inputNumber';

    public const INPUT_EMAIL = 'inputEmail';

    public const INPUT_CHECKBOX = 'inputCheckbox';

    public const INPUT_HIDDEN = 'inputHidden';

    public const INPUT_ATTACHMENT = 'inputAttachment';

    public const SELECTOR = 'selector';

    public const SELECTOR_OPTIONS = 'selectorOptions';

    public const INPUT_RADIO = 'inputRadio';

    public const RADIO_OPTIONS = 'radioOptions';

    public const TEXTAREA = 'textarea';

    public const SEPARATOR = 'separator';
}
`;

const customFormItemPhp = `<?php

declare(strict_types=1);

namespace SITE\\Enums\\DynamicCustomForms;

use SDK\\Core\\Enums\\Enum;

/**
 * This is the CustomFormItem enumeration class.
 *
 * @see Enum
 *
 * @package SITE/Enums/DynamicCustomForms
 */
abstract class CustomFormItem extends Enum {

    public const NAME = 'name';

    public const SET_DISABLED = 'setDisabled';
    
    public const SET_ID = 'setId';
    
    public const SET_CLASS = 'setClass';
    
    public const SET_VALUE = 'setValue';
    
    public const SET_DATA = 'setData';
    
    public const SET_MAX_LENGTH = 'setMaxlength';
    
    public const SET_MIN_LENGTH = 'setMinlength';
    
    public const SET_READONLY = 'setReadonly';
    
    public const SET_REGEX = 'setRegex';
    
    public const SET_LABEL_FOR = 'setLabelFor';
    
    public const SET_REQUIRED = 'setRequired';
}
`;

const customMailParametersPhp = `<?php

declare(strict_types=1);

namespace SITE\\Enums\\DynamicCustomForms;

use SDK\\Core\\Enums\\Enum;

/**
 * This is the CustomMailParameters enumeration class.
 *
 * @see Enum
 *
 * @package SITE/Enums/DynamicCustomForms
 */
abstract class CustomMailParameters extends Enum {

    public const TO_EMAIL = 'toEmail';

    public const SUBJECT = 'subject';

    public const DYNAMIC_TO_EMAIL = 'dynamicToEmail';

    public const TO_EMAIL_PARAMETER = 'toEmailParameter';

    public const TO_EMAIL_ENUM_CLASS_PARAMETER = 'toEmailEnumClassParameter';
}
`;

export const enums = [
  {
    name: 'CustomForm.php',
    path: '\\src\\Enums\\DynamicCustomForms',
    content: customFormPhp
  },
  {
    name: 'CustomFormItem.php',
    path: '\\src\\Enums\\DynamicCustomForms',
    content: customFormItemPhp
  },
  {
    name: 'CustomMailParameters.php',
    path: '\\src\\Enums\\DynamicCustomForms',
    content: customMailParametersPhp
  },
];