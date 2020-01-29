import { IAddObjectsDialogService } from "../../../common";

interface IConfigGroupsPanelBindings {
    [key: string]: any;
}

const ConfigGroupsPanelBindings: IConfigGroupsPanelBindings = {}

class ConfigGroupsPanelChanges implements ng.IOnChangesObject, IConfigGroupsPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class ConfigGroupsPanelController implements ng.IController {
    public $onInit() { }
    public edit: string;
    public status: string;
    public details: boolean = false;
    public defaultCollection: string[];
    public searchedCollection: string[];
    public people: iqs.shell.ControlObject[];
    public assets: iqs.shell.ControlObject[];
    public equipments: iqs.shell.ControlObject[];
    public transaction: pip.services.Transaction;
    public accessConfig: any;
    public currentState: () => void;
    public isPreLoading: boolean = true;
    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        private $rootScope: ng.IRootScopeService,
        private $location: ng.ILocationService,
        private iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        public pipMedia: pip.layouts.IMediaService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        public iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private pipTranslate: pip.services.ITranslateService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private iqsAddObjectsDialog: IAddObjectsDialogService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private pipNavService: pip.nav.INavService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {

        this.edit = this.$location.search().edit || 'data';
        this.transaction = pipTransaction.create('groups_panel');
        this.status = this.$location.search()['status'] || '';
        this.details = this.$location.search().details == 'details' || false;
        let objectType: string = iqs.shell.SearchObjectTypes.ObjectGroup;
        this.cf.push($rootScope.$on('pipMainResized', () => {
            this.change();
        }));

        const runWhenReady = () => {
            this.accessConfig = iqsAccessConfig.getStateConfigure().access;

            this.searchedCollection = this.iqsGlobalSearch.getSpecialSearchCollection(objectType);
            this.onSearchResult(this.status, true);
            this.currentState = () => {
                this.getObjects();
                this.change();
            }
            this.change();
            this.isPreLoading = false;
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, () => {
            this.appHeader();
        }));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public change() {
        this.getObjects();
        if (!this.pipMedia('gt-sm')) {
            if (this.$location.search()['edit'] == 'edit' || this.$location.search()['edit'] == 'add') {
                this.details = true;
            } else {
                this.details = this.$location.search().details == 'details' || false;
            }
            this.changeAppBar();
        } else {
            // this.details = this.$location.search().details == 'details' || false;
            this.details = false;
        }
        if (this.details) {
            this.$location.search('details', 'details');
        } else {
            this.$location.search('details', 'main');
        }
    }

    public state() {
        return this.iqsObjectGroupsViewModel.state;
    }

    public get collection(): iqs.shell.ObjectGroup[] {
        return this.iqsObjectGroupsViewModel.StatisticsDataCollectionItem();
    }

    public onSearchResult(query: string, init: boolean = false) {
        this.status = query;
        this.transaction.begin('search');
        this.iqsGlobalSearch.searchObjectsParallel(query, iqs.shell.SearchObjectTypes.ObjectGroup,
            (data) => {
                this.selectButtons(data, init);
                this.details = false;
                this.transaction.end();
                this.$location.search('status', this.status);
            });

    }

    public onCanselSearch() {
        this.status = null;
        this.$location.search('status', null);
        this.selectButtons(null, false);
    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
        this.changeAppBar();
        this.pipNavService.actions.hide();
    }

    private toMainFromDetails() {
        this.$location.search('details', 'main');
        this.change();
        this.changeAppBar();
    }

    public changeAppBar() {
        // if (!this.pipMedia('gt-sm') && this.details) {
        //     const detailsTitle = this.$location.search().details === iqs.shell.States.Add
        //         ? 'GROUPS_ADD_TITLE'
        //         : this.$location.search().details === iqs.shell.States.Edit
        //             ? 'GROUPS_EDIT_TITLE'
        //             : 'GROUPS_DETAILS_TITLE';

        //     this.pipNavService.breadcrumb.items = [
        //         <pip.nav.BreadcrumbItem>{
        //             title: "GROUPS", click: () => {
        //                 this.toMainFromDetails();
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
        //     this.pipNavService.breadcrumb.text = 'GROUPS';
        //     this.pipNavService.icon.showMenu();
        // }

        this.pipNavService.appbar.part('organizations', this.pipMedia('gt-sm'));
        this.pipNavService.breadcrumb.text = 'GROUPS';
        this.pipNavService.breadcrumb.breakpoint = 'gt-sm';

        if (!this.pipMedia('gt-sm')) {
            if (this.$location.search().details == 'details') {
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "GROUPS", click: () => {
                            this.toMainFromDetails();;
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "GROUP", click: () => {

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
                        this.$location.search('edit', 'data');
                        this.toMainFromDetails();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "GROUPS", click: () => {
                            this.$location.search('edit', 'data');
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "ADD", click: () => {

                        }
                    }
                ];
            }

            if (this.$location.search().details == 'edit') {
                if (!this.pipMedia('gt-sm')) {
                    this.pipNavService.icon.showBack(() => {
                        this.$location.search('edit', 'data');
                        this.toMainFromDetails();
                    });
                } else {
                    this.pipNavService.icon.showMenu();
                }
                this.pipNavService.breadcrumb.items = [
                    <pip.nav.BreadcrumbItem>{
                        title: "GROUPS", click: () => {
                            this.$location.search('edit', 'data');
                            this.toMainFromDetails();
                        }
                    },
                    <pip.nav.BreadcrumbItem>{
                        title: "EDIT", click: () => {

                        }
                    }
                ];
            }

        } else {
            this.pipNavService.icon.showMenu();
        }
    }

    public selectButtons(data, init: boolean = false) {
        this.$location.search('type', this.status);
        if (data) {
            this.iqsObjectGroupsViewModel.filterWithObjects(data);
        } else {
            this.iqsObjectGroupsViewModel.filterWithObjects(undefined);
        }

        if (init) {
            if (this.$location.search()['group_id']) {
                let index: number = _.findIndex(this.iqsObjectGroupsViewModel.StatisticsDataCollectionItem(), { id: this.$location.search()['group_id'] });
                if (index != -1) {
                    this.iqsObjectGroupsViewModel.selectItem(index);
                }
            }
        }
        this.getObjects();
        //this.iqsCurrentObjectStatesViewModel.filterCurrentObjectStatesObjects(this.status);

        //this.iqsCurrentObjectStatesViewModel.selectItem(this.status);
    }

    public selectedIndex() {
        return this.iqsObjectGroupsViewModel.getSelectedIndex();
    }

    public selectItem(index: number) {

        if (this.edit == 'add' || this.edit == 'edit') return;

        this.iqsObjectGroupsViewModel.selectItem(index);
        this.getObjects();
        if (!this.pipMedia('gt-sm')) {
            this.details = true;
            this.$location.search('details', 'details');
            this.changeAppBar();
        }
    }

    public getObjects() {
        let object: iqs.shell.ControlObject,
            group: iqs.shell.ObjectGroup = this.iqsObjectGroupsViewModel.StatisticsDataCollectionItem()[this.iqsObjectGroupsViewModel.getSelectedIndex()];
        this.assets = [];
        this.people = [];
        this.equipments = [];
        let removeIds: string[] = [];
        if (group) {
            group.object_ids.forEach(element => {
                object = this.iqsObjectsViewModel.getObjectById(element);
                if (!object) {
                    removeIds.push(element);

                    return;
                }

                if (object.category == iqs.shell.ObjectCategory.People) {
                    this.people.push(object);

                    return;
                }
                if (object.category == iqs.shell.ObjectCategory.Asset) {
                    this.assets.push(object);

                    return;
                }
                if (object.category == iqs.shell.ObjectCategory.Equipment) {
                    this.equipments.push(object);

                    return;
                }
            });

            group.object_ids = _.xor(group.object_ids, removeIds)
        }

    }


    public changeEdit() {
        this.edit = 'edit';
        this.$location.search('edit', 'edit');
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
        configParams.title = this.pipTranslate.translate('DELETE_GROUP') + this.collection[this.selectedIndex()].name + '?';
        configParams.ok = 'DELETE';
        configParams.cancel = 'CANCEL';

        this.pipConfirmationDialog.show(configParams, () => {

            this.transaction.begin('delete group');
            this.iqsObjectGroupsViewModel.deleteObjectGroupById(id, () => {
                this.getObjects();
                this.transaction.end();

                if (!this.pipMedia('gt-sm')) {
                    this.details = false;
                    this.$location.search('details', 'main');
                    this.changeAppBar();
                }
            }, () => { });
        })
    }

    public selectObject(id: string) {
        this.$state.go('app.objects', { object_id: id })
    }

    public deleteObject(object: iqs.shell.ControlObject) {
        let configParams: pip.dialogs.ConfirmationDialogParams = {},
            group: iqs.shell.ObjectGroup = _.cloneDeep(this.collection[this.selectedIndex()]);
        configParams.title = this.pipTranslate.translate('GROUPS_DELETE_OBJECT_GROUP') + object.name +
            this.pipTranslate.translate('GROUPS_DELETE_OBJECT_GROUP_FROM_GROUP') + group.name + '?';
        configParams.ok = 'GROUPS_REMOVE_OBJECT';
        configParams.cancel = 'CANCEL';

        this.pipConfirmationDialog.show(configParams, () => {
            group.object_ids = _.without(group.object_ids, object.id);
            this.transaction.begin('add object');
            this.iqsObjectGroupsViewModel.updateObjectGroupById(group.id, group, (item) => {
                this.selectItem(this.selectedIndex());
                this.transaction.end('add ');
            })
        })
    }

    public addObjects() {
        let group: iqs.shell.ObjectGroup = _.cloneDeep(this.collection[this.selectedIndex()]);
        let initObjects: any[] = [];
        group.object_ids.forEach(element => {
            initObjects.push({ object_id: element });
        });
        this.iqsAddObjectsDialog.show({ initObjects: initObjects }, (data: iqs.shell.SearchResult[]) => {

            this.transaction.begin('add objects');
            group.object_ids = [];
            data.forEach(element => {
                group.object_ids.push(element.id);
            });
            this.iqsObjectGroupsViewModel.updateObjectGroupById(group.id, group, (item) => {
                this.selectItem(this.selectedIndex());
                this.transaction.end();
            }, (err) => {
                this.transaction.end('err');
            })
        })

    }


}

(() => {
    angular
        .module('iqsConfigGroupsPanel', [
            'iqsConfigGroupEditPanel',
            'iqsAddObjectsDialog'
        ])
        .component('iqsGroupsPanel', {
            bindings: ConfigGroupsPanelBindings,
            templateUrl: 'config/groups/panels/GroupsPanel.html',
            controller: ConfigGroupsPanelController,
            controllerAs: '$ctrl'
        })
})();
