interface IConfigObjectsPanelBindings {
    [key: string]: any;
}

const ConfigObjectsPanelBindings: IConfigObjectsPanelBindings = {}

class ConfigObjectsPanelChanges implements ng.IOnChangesObject, IConfigObjectsPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class ConfigObjectStatues {
    title: string;
    id: string;
}
class ConfigObjectTabs {
    title: string;
    id: number;
}

class ConfigObjectsPanelController implements ng.IController {
    public $onInit() { }
    public statuses: ConfigObjectStatues[] = [
        {
            title: 'PEOPLE',
            id: iqs.shell.ObjectCategory.People
        }, {
            title: 'DEVICES',
            id: iqs.shell.ObjectCategory.Equipment
        }, {
            title: 'ASSETS',
            id: iqs.shell.ObjectCategory.Asset
        }];
    public sections: ConfigObjectTabs[] = [
        {
            title: 'INFORMATION',
            id: 0
        }, {
            title: 'GROUPS',
            id: 1
        }
    ];
    public details: boolean = false;
    public status: string = '';
    public section: number;
    public edit: string;
    public defaultCollection: string[];
    public searchedCollection: string[];
    private currentStateOld: any;
    public currentStateFunc: () => void;
    public categoryCollection: iqs.shell.TypeCollection;
    public typeCollection: iqs.shell.TypeCollection;
    public objectGroups: any = {};
    public accessConfig: any;
    public isPreLoading: boolean = true;
    private cf: Function[] = [];

    constructor(
        private $location: ng.ILocationService,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private $state: ng.ui.IStateService,
        private iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
        private iqsDevicesViewModel: iqs.shell.IDevicesViewModel,
        private iqsMultiSelectDialog: iqs.shell.IMultiSelectDialogService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private iqsObjectConfigs: iqs.shell.IObjectConfigsService,
        public pipMedia: pip.layouts.IMediaService,
        iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        private pipTranslate: pip.services.ITranslateService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private $rootScope: ng.IRootScopeService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private pipNavService: pip.nav.INavService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.edit = $location.search().edit || 'data';
        if (this.edit == 'add') {
            this.iqsDevicesViewModel.selectedIndex = null;
        }

        if (!this.pipMedia('gt-sm')) {
            this.details = $location.search().details == 'details' ? true : false;
        } else {
            this.details = false;
            this.$location.search('details', 'main');
        }

        this.cf.push($rootScope.$on('pipMainResized', () => {
            if (!this.pipMedia('gt-sm')) {
            } else {
                this.details = false;
                this.$location.search('details', 'main');
                this.changeAppBar();
            }
        }));
        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;
            this.config();
            iqsTypeCollectionsService.init();
            this.typeCollection = iqsTypeCollectionsService.getObjectType();
            this.categoryCollection = iqsTypeCollectionsService.getObjectCategory();
            this.currentStateFunc = () => {
                this.currentState();
                if (!this.pipMedia('gt-sm')) {
                    const edit = this.$location.search()['edit'];
                    if (['edit', 'add', 'data'].includes(edit)) {
                        this.details = true;
                        this.$location.search('details', 'details');
                    }
                    this.changeAppBar();
                }
            }

            let objectType: string = iqs.shell.SearchObjectTypes.ControlObject;

            if (!this.iqsGlobalSearch.isInit) {
                this.iqsGlobalSearch.init();
            }
            this.searchedCollection = this.iqsGlobalSearch.getSpecialSearchCollection(objectType);
            this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(objectType);

            this.iqsObjectsViewModel.initObjects(this.status, () => {
                this.onSearchResult(this.status, true);
                this.isPreLoading = false;
                this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates(null, () => {
                    if (this.status) {
                        this.onSearchResult(this.status);
                    }
                    this.currentState();
                });
            });
            // fill groups 
            this.objectGroups = {};
            _.each(this.iqsObjectGroupsViewModel.getCollection(), (group: iqs.shell.ObjectGroup) => {
                this.objectGroups[group.id] = group;
            });

        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public getGroupName(id: string): string {
        let name: string = this.objectGroups[id] ? this.objectGroups[id].name : '';

        return name;
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public onSearchResult(query: string, init: boolean = false) {
        this.status = query;
        this.iqsGlobalSearch.searchObjectsParallel(query, iqs.shell.SearchObjectTypes.ControlObject,
            (data) => {
                this.selectButtons(data, init);
            });

    }

    public onCanselSearch() {
        this.status = null;
        this.$location.search('type', null);
        this.selectButtons(null, true);
    }

    public selectButtons(data, init: boolean = false) {
        this.$location.search('type', this.status);
        if (data) {
            this.iqsObjectsViewModel.filterObjectsArray(data);
        } else {
            this.iqsObjectsViewModel.filterObjects('all');
        }
        this.iqsObjectsViewModel.selectItem();
        this.currentState();
    }


    public config() {
        this.edit = this.$location.search().edit || 'data';

        if (this.iqsObjectConfigs.section) {
            this.$location.search('section', this.iqsObjectConfigs.section);
        }

        this.status = this.$location.search()['type'] || '';

        if (this.status) {
            this.onSearchResult(this.status);
        }
        this.section = this.iqsObjectConfigs.section || this.$location.search()['section'] || this.sections[0].id;
        this.iqsObjectConfigs.type = this.status;
        this.iqsObjectConfigs.section = this.section;
    }

    public get collection() {
        return this.iqsObjectsViewModel.getObjects();
    }

    public state() {
        return this.iqsObjectsViewModel.state;
    }

    public selectedIndex() {
        return this.iqsObjectsViewModel.selectedIndex;
    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
        this.pipNavService.actions.hide();
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.actions.hide();
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        this.changeAppBar();
    }

    private toMainFromDetails() {
        this.$location.search('details', 'main');
        if (!this.pipMedia('gt-sm')) {
            this.details = this.$location.search().details == 'details' ? true : false;
            this.edit = this.$location.search().edit || 'data';
        }
        this.changeAppBar();
    }

    public changeAppBar() {
        // if (!this.pipMedia('gt-sm') && this.details) {
        //     const detailsTitle = this.$location.search().details === iqs.shell.States.Add
        //         ? 'OBJECTS_ADD_TITLE'
        //         : this.$location.search().details === iqs.shell.States.Edit
        //             ? 'OBJECTS_EDIT_TITLE'
        //             : 'OBJECTS_DETAILS_TITLE';
        //     this.pipNavService.breadcrumb.items = [
        //         <pip.nav.BreadcrumbItem>{
        //             title: "OBJECTS", click: () => {
        //                 this.$location.search('details', 'main');
        //                 this.$location.search('edit', 'data');
        //             }
        //         },
        //         <pip.nav.BreadcrumbItem>{
        //             title: detailsTitle, click: () => { }
        //         }
        //     ];
        //     this.pipNavService.icon.showBack(() => {
        //         this.toMainFromDetails();
        //     });
        // } else {
        //     this.pipNavService.breadcrumb.text = 'OBJECTS';
        //     this.pipNavService.icon.showMenu();
        // }
        this.pipNavService.appbar.part('organizations', this.pipMedia('gt-sm'));
        this.pipNavService.breadcrumb.text = 'OBJECTS';
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm')) {
            if (this.$location.search().details == 'details') {

                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "OBJECTS", click: () => {
                            this.$location.search('edit', 'data');
                            this.changeAppBar();
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "OBJECTS_DETAILS_TITLE", click: () => {

                        }
                    }
                ];
                this.pipNavService.icon.showBack(() => {
                    this.toMainFromDetails();
                });
            } else {
                this.pipNavService.icon.showMenu();
            }


            if (this.$location.search().details == 'add') {
                if (!this.pipMedia('gt-sm')) {
                    this.pipNavService.icon.showBack(() => {
                        this.$location.search('details', 'main');
                        this.$location.search('edit', 'data');
                        // this.$rootScope.$broadcast('iqsChangeNavPage');
                        this.changeAppBar();
                        this.toMainFromDetails();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "OBJECTS", click: () => {
                            // this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            // this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.changeAppBar();
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "OBJECTS_ADD_TITLE", click: () => {

                        }
                    }
                ];
            }

            if (this.$location.search().details == 'edit') {
                if (!this.pipMedia('gt-sm')) {
                    this.pipNavService.icon.showBack(() => {
                        // this.$location.search('details', 'main');
                        this.$location.search('edit', 'data');
                        // this.$rootScope.$broadcast('iqsChangeNavPage');
                        this.changeAppBar();
                        this.toMainFromDetails();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "OBJECTS", click: () => {
                            // this.$location.search('details', 'main');
                            this.$location.search('edit', 'data');
                            // this.$rootScope.$broadcast('iqsChangeNavPage');
                            this.changeAppBar();
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "OBJECTS_EDIT_TITLE", click: () => {

                        }
                    }
                ];
            }

        } else {
            this.pipNavService.icon.showMenu();
        }
    }

    public currentState() {
        let item: iqs.shell.ObjectState;
        if (this.collection[this.selectedIndex()]) {
            item = _.find(this.iqsCurrentObjectStatesViewModel.allCurrentObjectStates, { object_id: this.collection[this.selectedIndex()].id });
        }

        if (item) {
        } else {
            item = new iqs.shell.ObjectState();
        }
        if (this.collection[this.selectedIndex()]) {
            item.object = this.iqsObjectsViewModel.getObjectById(this.collection[this.selectedIndex()].id);
            item.object_id = item.object.id;
            item.device = this.iqsDevicesViewModel.getDeviceById(item.object.device_id);
            item.device_id = item.object.device_id;
        }
        this.currentStateOld = item;
    }


    public selectItem(index: number) {
        if (this.edit == 'add' || this.edit == 'edit') {
            return;
        }
        if (this.iqsObjectsViewModel.getObjects(this.status).length > 0 && this.iqsObjectsViewModel.getObjects(this.status)[index]) {
            this.iqsObjectConfigs.id = this.iqsObjectsViewModel.getObjects()[index].id;
            this.$location.search('object_id', this.iqsObjectsViewModel.getObjects(this.status)[index].id);
        }
        this.iqsObjectsViewModel.selectedIndex = index;

        this.currentState();

        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.changeAppBar();
        }
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsObjectsViewModel.getTransaction();
    }

    public selectSection(id: string) {
        this.$location.search('section', this.section);
        this.iqsObjectConfigs.section = this.section;
    }

    public singleContent() {
        this.details = !this.details;
    }

    public changeEdit() {
        this.edit = 'edit';
        this.$location.search('edit', 'edit');
        this.$location.search('details', 'edit');
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
        }
        this.changeAppBar();
    }

    public addClick() {
        //this.iqsDevicesViewModel.selectedIndex = null;
        this.edit = 'add';
        this.$location.search('edit', 'add');
        this.$location.search('details', 'add');
        this.changeAppBar();
    }

    public delete(id: string) {
        let configParams: pip.dialogs.ConfirmationDialogParams = {};
        configParams.title = this.pipTranslate.translate('DELETE_OBJECT') + this.collection[this.selectedIndex()].name + '?';
        configParams.ok = 'DELETE';
        configParams.cancel = 'CANCEL';

        this.pipConfirmationDialog.show(configParams, () => {
            this.iqsObjectsViewModel.deleteObject(id, () => {
                this.currentState();
                this.iqsDevicesViewModel.read();
                if (!this.pipMedia('gt-sm')) {
                    this.details = false;
                    this.$location.search('details', 'main');
                    this.changeAppBar();
                }
            }, () => { });
        })
    }

    public deleteGroup(group_id: string) {
        this.pipConfirmationDialog.show({ title: 'CONFIG_GROUPS_BACK', cancel: 'CANCEL', ok: 'CONFIG_GROUPS_BACK_OK' }, () => {

            let object: iqs.shell.ControlObject = this.collection[this.selectedIndex()];
            object.group_ids = _.filter(object.group_ids, (id: string) => {
                return group_id != id
            })
            this.iqsObjectsViewModel.updateObject(object, () => {
                this.currentState();
                this.iqsObjectGroupsViewModel.read();
            }, () => { });
        })
    }

    public addGroups(object: iqs.shell.ControlObject) {
        let params: iqs.shell.MultiSelectDialogParams = { entityType: iqs.shell.SearchObjectTypes.ObjectGroup };
        params.dialogTitle = this.pipTranslate.translate("CONFIGURATION_OBJECTS_ADD_GROUPS");
        params.initCollection = [];
        object.group_ids.forEach(element => {
            params.initCollection.push({ id: element });
        });
        this.iqsMultiSelectDialog.show(params, (data: any[]) => {
            object.group_ids = [];
            data.forEach(element => {
                object.group_ids.push(element.id);
            });
            this.iqsObjectsViewModel.updateObject(object, () => {
                this.currentState();
                this.iqsObjectGroupsViewModel.read();
            })
        })
    }

}

(() => {
    angular
        .module('iqsConfigObjectsPanel', ['iqsConfigObjectEditPanel', 'iqsConfigObjectsInformationPanel', 'iqsMultiSelectDialog'])
        .component('iqsObjectsPanel', {
            bindings: ConfigObjectsPanelBindings,
            templateUrl: 'config/objects/panels/ObjectsPanel.html',
            controller: ConfigObjectsPanelController,
            controllerAs: '$ctrl'
        })
})();
