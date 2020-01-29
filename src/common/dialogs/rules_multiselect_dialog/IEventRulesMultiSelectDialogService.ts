export class EventRulesMultiSelectDialogParams {
    dialogTitle?: string;
    initCollection?: iqs.shell.EventRule[];
    addButtonLabel?: string;
    ruleCollection: iqs.shell.EventRule[];
}

export interface IEventRulesMultiSelectDialogService {
    show(params: EventRulesMultiSelectDialogParams, successCallback?: (data?: any) => void, cancelCallback?: () => void): any;
}