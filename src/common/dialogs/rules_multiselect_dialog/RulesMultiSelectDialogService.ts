import { IEventRulesMultiSelectDialogService, EventRulesMultiSelectDialogParams } from './IEventRulesMultiSelectDialogService';

class EventRulesMultiSelectDialogService implements IEventRulesMultiSelectDialogService {
    public _mdDialog: angular.material.IDialogService;

    public constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }


    public show(params: EventRulesMultiSelectDialogParams, successCallback?: (data?: iqs.shell.EventRule[]) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            templateUrl: 'common/dialogs/rules_multiselect_dialog/EventRulesMultiSelectDialog.html',
            controller: 'iqsEventRulesMultiSelectDialogController',
            controllerAs: '$ctrl',
            locals: { params: params },
            bindToController: true,
            clickOutsideToClose: true
        })
            .then(
                (data?: iqs.shell.EventRule[]) => {
                    if (successCallback) {
                        successCallback(data);
                    }
                },
                () => {
                    if (cancelCallback) {
                        cancelCallback();
                    }
                }
            );
    }

}

angular
    .module('iqsEventRulesMultiSelectDialog')
    .service('iqsEventRulesMultiSelectDialog', EventRulesMultiSelectDialogService);