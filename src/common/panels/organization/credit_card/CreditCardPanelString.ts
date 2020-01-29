(() => {
    function declareCreditCardPanelTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            CREDIT_CARD_VISA: 'visa',
            CREDIT_CARD_MAESTRO: 'maestro',
            CREDIT_CARD_MASTERCARD: 'mastercard',
            CREDIT_CARD_DISCOVER: 'discover',
            CREDIT_CARD_AMERICAN_EXPRESS: 'amex',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_LABEL: 'Credit card number',
            ORGANIZATIONS_CREATE_CREDIT_CARD_TYPE_LABEL: 'Card type',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_PLACEHOLDER: 'Enter card number',
            ORGANIZATIONS_CREATE_CREDIT_CARD_FIRST_NAME_LABEL: 'Fisrt Name on Card',
            ORGANIZATIONS_CREATE_CREDIT_CARD_LAST_NAME_LABEL: 'Last Name on Card',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NAME_PLACEHOLDER: 'Enter the name of the CC holder',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_LABEL: 'Security code',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_HINT: 'See the oppoorganization side of the card',
            ORGANIZATIONS_CREATE_CREDIT_CARD_EXPIRED_LABEL: 'Expires date: month/year',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_REQ_ERR: 'Enter credit card security code',
            ORGANIZATIONS_CREATE_CREDIT_CARD_FIRST_NAME_REQ_ERR: "Enter the name of the CC's holder",
            ORGANIZATIONS_CREATE_CREDIT_CARD_LAST_NAME_REQ_ERR: "Enter the name of the CC's holder",
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_PATTERN_ERR: 'Incorrect CC number',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_REQ_ERR: "Enter your CC's security code (CSC)",
            ORGANIZATIONS_CREATE_CREDIT_CARD_FIRST_NAME_PATTERN_ERR: 'Please enter name in English',
            ORGANIZATIONS_CREATE_CREDIT_CARD_LAST_NAME_PATTERN_ERR: 'Please enter name in English',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_PATTERN_ERR: 'Incorrect security code, please enter 3-4 digit',
        });
        pipTranslateProvider.translations('ru', {
            CREDIT_CARD_VISA: 'visa',
            CREDIT_CARD_MAESTRO: 'maestro',
            CREDIT_CARD_MASTERCARD: 'mastercard',
            CREDIT_CARD_DISCOVER: 'discover',
            CREDIT_CARD_AMERICAN_EXPRESS: 'amex',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_LABEL: 'Номер карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_TYPE_LABEL: 'Тип карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_PLACEHOLDER: 'Введите номер карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_FIRST_NAME_LABEL: 'Имя на карте',
            ORGANIZATIONS_CREATE_CREDIT_CARD_LAST_NAME_LABEL: 'Фамилия на карте',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NAME_PLACEHOLDER: 'Введите имя указанное на карте',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_LABEL: 'Код безопасности',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_HINT: 'Указан на обратной стороне карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_EXPIRED_LABEL: 'Срок действия: месяц/год',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_REQ_ERR: 'Укажите код кредитной карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_FIRST_NAME_REQ_ERR: 'Укажите имя владельца кредитной карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_LAST_NAME_REQ_ERR: 'Укажите фамилию владельца кредитной карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_NUMBER_PATTERN_ERR: 'Код кредитной карты введен не верно',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_REQ_ERR: 'Укажите код безопасности кредитной карты',
            ORGANIZATIONS_CREATE_CREDIT_CARD_FIRST_NAME_PATTERN_ERR: 'Пожалуйста введите имя используя английские символы',
            ORGANIZATIONS_CREATE_CREDIT_CARD_LAST_NAME_PATTERN_ERR: 'Пожалуйста введите фамилию используя английские символы',
            ORGANIZATIONS_CREATE_CREDIT_CARD_CODE_PATTERN_ERR: 'Неверно введен код безопасности, введите 3 или 4 цифры',
        });
    }

    angular
        .module('iqsCreditCardPanel')
        .config(declareCreditCardPanelTranslateResources);
})();