import { EventRulesMultiSelectDialogParams } from './IEventRulesMultiSelectDialogService';

export class SearchResultChecked extends iqs.shell.SearchResult {
    checked?: boolean;
}

export class EventRulesMultiSelectDialogController extends EventRulesMultiSelectDialogParams implements ng.IController {

    public $onInit() { }

    public theme;
    public defaultCollection: string[];
    public searchedCollection: string[];
    public severityCollection: iqs.shell.TypeNumericCollection;

    public search: string;
    public collection: SearchResultChecked[];
    public allCollection: SearchResultChecked[];
    public initCollection: iqs.shell.EventRule[];

    private configState: string;

    constructor(
        private $mdDialog: angular.material.IDialogService,
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        params: EventRulesMultiSelectDialogParams
    ) {
        "ngInject";

        super();

        this.severityCollection = this.iqsTypeCollectionsService.getSeverity();
        this.dialogTitle = params.dialogTitle ? params.dialogTitle : 'RULES_MULTISELECT_DIALOG_TITLE';
        this.initCollection = params.initCollection ? params.initCollection : [];
        this.configState = 'settings_system.rules';
        this.addButtonLabel = params.addButtonLabel ? params.addButtonLabel : 'RULES_MULTISELECT_DIALOG_ADD_BUTTON';
        this.ruleCollection = params.ruleCollection ? params.ruleCollection : [];

        this.theme = $rootScope[pip.themes.ThemeRootVar];
        this.search = '';
        this.searchedCollection = [];
        _.each(this.ruleCollection, (rule) => {
            if (rule.name) {
                this.searchedCollection.push(rule.name.toLocaleLowerCase());
            }
        });

        this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(iqs.shell.SearchObjectTypes.EventRule) || [];
        this.collection = this.getSearchedCollection();
        this.initSelectedItems();
        this.allCollection = _.cloneDeep(this.collection);
    }

    public initSelectedItems() {
        if (this.initCollection && this.initCollection.length > 0) {
            this.initCollection.forEach(element => {
                let index: number = _.findIndex(this.collection, { id: element.id });
                if (index != - 1) {
                    this.collection[index].checked = true;
                }
            });
        }
    }

    private updateCollection() {
        let initCollection: iqs.shell.EventRule[] = [];
        _.each(this.collection, (item: SearchResultChecked) => {
            let index = _.findIndex(this.allCollection, { id: item.id });
            if (index > -1) {
                this.allCollection[index].checked = item.checked;
            }
        });

        _.each(this.allCollection, (item: SearchResultChecked) => {
            if (item.checked) {
                initCollection.push(item.item);
            }
        });

        this.initCollection = initCollection;
    }

    private getSearchedCollection(): SearchResultChecked[] {
        let data: SearchResultChecked[] = [];
        if (this.search) {
            let searchQuery = this.search.toLocaleLowerCase();
            _.each(this.ruleCollection, (rule: iqs.shell.EventRule) => {
                if (rule.name) {
                    if (rule.name.toLocaleLowerCase().indexOf(searchQuery) >= 0) {
                        data.push({
                            object_type: iqs.shell.SearchObjectTypes.EventRule,
                            item: rule,
                            id: rule.id
                        });
                    }
                }
            });
        } else {
            _.each(this.ruleCollection, (rule: iqs.shell.EventRule) => {
                data.push({
                    object_type: iqs.shell.SearchObjectTypes.EventRule,
                    item: rule,
                    id: rule.id
                });
            });
        }

        return data;
    }

    public onSearchResult(query: string) {
        this.search = query;
        this.updateCollection();
        this.collection = this.getSearchedCollection();
        this.initSelectedItems();
    }

    public onCanselSearch() {
        this.search = '';
        this.onSearchResult(this.search);
    }

    private getSelected() {
        this.updateCollection();
        let result: SearchResultChecked[] = [];
        _.each(this.allCollection, (item: SearchResultChecked) => {
            if (item.checked) {
                result.push(item.item)
            }
        });

        return result;
    }

    public change() {
        this.$mdDialog.hide(this.getSelected());
    }

    public cancel() {
        this.$mdDialog.cancel();
    }

    public config() {
        this.$mdDialog.cancel();
        this.$state.go('settings_system.rules');
    }

}


angular
    .module('iqsEventRulesMultiSelectDialog', [
        'ngMaterial', 'iqsFormats.ObjectFilter'
    ])
    .controller('iqsEventRulesMultiSelectDialogController', EventRulesMultiSelectDialogController);

import "./EventRulesMultiSelectDialogService"