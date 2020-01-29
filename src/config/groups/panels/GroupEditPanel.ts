interface IConfigGroupEditPanelBindings {
    [key: string]: any;
    group: any;
    edit: any;
    change: any;
}

const ConfigGroupEditPanelBindings: IConfigGroupEditPanelBindings = {
    group: '<?iqsGroup',
    edit: '=iqsEdit',
    change: '=iqsChange'
}

class ConfigGroupEditPanelChanges implements ng.IOnChangesObject, IConfigGroupEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    group: ng.IChangesObject<iqs.shell.ObjectGroup>;
    edit: ng.IChangesObject<boolean>;
    change: ng.IChangesObject<() => void>;
}

class ConfigGroupEditPanelController implements ng.IController {
    public $onInit() { }
    public group: iqs.shell.ObjectGroup;
    public groupLocal: iqs.shell.ObjectGroup;
    public edit: string;
    public picture: any;
    public typeCollection: iqs.shell.TypeCollection;
    public change: () => void;
    constructor(
        private $state: ng.ui.IStateService,
        $rootScope: ng.IRootScopeService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        private iqsLoading: iqs.shell.ILoadingService
    ) {

        if (this.iqsLoading.isDone) { this.group = _.cloneDeep(this.group); }
        $rootScope.$on(iqs.shell.LoadingCompleteEvent, () => { this.group = _.cloneDeep(this.group); });
    }

    public $onChanges(changes: ConfigGroupEditPanelChanges) {
        if (changes.group) {
            this.group = _.cloneDeep(changes.group.currentValue);
            if (!this.group) this.group = new iqs.shell.ObjectGroup();
        }
    }

    private saveAvatar() {
        if (this.picture) {

            this.picture.save(
                this.group.id,
                // Success callback
                () => {
                    this.edit = 'data';
                    //this.iqsObjectGroupsViewModel.selectItem(_.findIndex(this.iqsObjectGroupsViewModel.StatisticsDataCollectionItem, { id: this.$location.search()['group_id'] }))
                    this.$location.search('edit', 'data');
                    if (this.change) {
                        this.change();
                    }
                },
                // Error callback
                (error) => {
                    console.error(error); // eslint-disable-line
                    this.edit = 'data';
                    //this.iqsObjectGroupsViewModel.selectItem(_.findIndex(this.iqsObjectGroupsViewModel.StatisticsDataCollectionItem, { id: this.$location.search()['group_id'] }))
                    this.$location.search('edit', 'data');
                    if (this.change) {
                        this.change();
                    }
                });
        } else {
            this.edit = 'data';
            //this.iqsObjectGroupsViewModel.selectItem(_.findIndex(this.iqsObjectGroupsViewModel.StatisticsDataCollectionItem, { id: this.$location.search()['group_id'] }))
            this.$location.search('edit', 'data');
            if (this.change) {
                this.change();
            }
        }
    }


    public cancelClick() {
        if (this.change) {
            this.change();
        }

        this.edit = 'data';
        //this.iqsObjectGroupsViewModel.selectItem(_.findIndex(this.iqsObjectGroupsViewModel.StatisticsDataCollectionItem, { id: this.$location.search()['group_id'] }))
        this.$location.search('edit', 'data');
        //  this.$location.search('details', 'details');
    }

    public saveClick() {
        this.group.org_id = this.iqsOrganization.orgId;
        if (!Array.isArray(this.group.object_ids)) this.group.object_ids = [];
        if (this.edit == 'add') {
            this.iqsObjectGroupsViewModel.create(this.group, (data) => {
                this.$location.search('group_id', data.id);
                this.group = data;
                this.saveAvatar();
            })
        } else {

            this.iqsObjectGroupsViewModel.updateObjectGroupById(this.group.id, this.group, (item) => {
                this.change();
                this.saveAvatar();
            }, (err) => { })
        }
    }

    public onPictureCreated(obj) {
        this.picture = obj.$control;
    };

    public onPictureChanged = function ($control) {

    };


    public onResetClick() {
        this.picture.reset();
    };
}

(() => {
    angular
        .module('iqsConfigGroupEditPanel', [])
        .component('iqsGroupEditPanel', {
            bindings: ConfigGroupEditPanelBindings,
            templateUrl: 'config/groups/panels/GroupEditPanel.html',
            controller: ConfigGroupEditPanelController,
            controllerAs: '$ctrl'
        })
})();
