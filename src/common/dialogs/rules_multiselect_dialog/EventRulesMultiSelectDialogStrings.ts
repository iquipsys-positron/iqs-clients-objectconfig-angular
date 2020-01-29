
{
    function declareEventRulesMultiDialogTranslateResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            RULES_MULTISELECT_DIALOG_TITLE: 'Apply rules',
            RULES_MULTISELECT_DIALOG_ADD_BUTTON: 'Apply'

        });
        pipTranslateProvider.translations('ru', {
            RULES_MULTISELECT_DIALOG_TITLE: 'Применить правила',
            RULES_MULTISELECT_DIALOG_ADD_BUTTON: 'Применить'
        });
    }

    angular
        .module('iqsEventRulesMultiSelectDialog')
        .config(declareEventRulesMultiDialogTranslateResources);
}
