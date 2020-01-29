interface IConfigObjectEditPanelBindings {
    [key: string]: any;
    object: any;
    edit: any;
}

const ConfigObjectEditPanelBindings: IConfigObjectEditPanelBindings = {
    object: '<iqsObject',
    edit: '=iqsEdit',
    change: '=iqsChange'
}

class ConfigObjectEditPanelChanges implements ng.IOnChangesObject, IConfigObjectEditPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    object: ng.IChangesObject<iqs.shell.ControlObject>;
    edit: ng.IChangesObject<boolean>;
    change: ng.IChangesObject<() => void>;
}

class ConfigObjectEditPanelController implements ng.IController {
    public $onInit() { }
    public object: iqs.shell.ControlObject;
    public objectLocal: iqs.shell.ControlObject;
    public edit: string;
    public picture: any;
    public categoryCollection: iqs.shell.TypeCollection;
    public typeCollection: any[];
    public change: () => void;

    public form: any;
    public touchedErrorsWithHint: Function;
    public nameCollection: string[];
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $state: ng.ui.IStateService,
        private $scope: ng.IScope,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private $location: ng.ILocationService,
        private pipFormErrors: pip.errors.IFormErrorsService,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        const runWhenReady = () => {
            this.object = _.cloneDeep(this.object);
            iqsTypeCollectionsService.init();
            this.categoryCollection = iqsTypeCollectionsService.getObjectCategory();
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    public $postLink() {
        this.form = this.$scope.form;
    }

    public filterTypeCollection() {
        let typeCollection = [];
        _.values(this.iqsTypeCollectionsService.getObjectType()).forEach(element => {
            if (element.id == iqs.shell.ObjectType.Other) {
                typeCollection.push(element);
            }
            if (this.object.category == iqs.shell.ObjectCategory.People) {
                if (element.id == iqs.shell.ObjectType.Employee || element.id == iqs.shell.ObjectType.Contractor || element.id == iqs.shell.ObjectType.Visitor) {
                    typeCollection.push(element);
                }
            }
            if (this.object.category == iqs.shell.ObjectCategory.Asset) {
                if (element.id == iqs.shell.ObjectType.Pump ||
                    element.id == iqs.shell.ObjectType.Generator ||
                    element.id == iqs.shell.ObjectType.Crane ||
                    element.id == iqs.shell.ObjectType.ForkLift ||
                    element.id == iqs.shell.ObjectType.AccessPoint ||
                    element.id == iqs.shell.ObjectType.Welding) {
                    typeCollection.push(element);
                }
            }
            if (this.object.category == iqs.shell.ObjectCategory.Equipment) {
                if (element.id == iqs.shell.ObjectType.Excavator || element.id == iqs.shell.ObjectType.HaulTruck ||
                    element.id == iqs.shell.ObjectType.Drill ||
                    element.id == iqs.shell.ObjectType.Dozer ||
                    element.id == iqs.shell.ObjectType.Grader ||
                    element.id == iqs.shell.ObjectType.Bus ||
                    element.id == iqs.shell.ObjectType.WaterTruck ||
                    element.id == iqs.shell.ObjectType.BlastTruck ||
                    element.id == iqs.shell.ObjectType.SpecialVehicle ||
                    element.id == iqs.shell.ObjectType.Locomotive ||
                    element.id == iqs.shell.ObjectType.Dumpcar ||
                    element.id == iqs.shell.ObjectType.VacuumTruck ||
                    element.id == iqs.shell.ObjectType.LightVehicle) {
                    typeCollection.push(element);
                }
            }
        });

        this.nameCollection = [];
        // fill collection without editing object
        _.each(this.iqsObjectsViewModel.allObjects, (item: iqs.shell.ControlObject) => {
            if (this.object.id && this.object.id != item.id && item.name || !this.object.id && item.name) {
                this.nameCollection.push(item.name);
            }
        });

        this.typeCollection = typeCollection;
    }

    public $onChanges(changes: ConfigObjectEditPanelChanges) {
        if (changes.object) {
            this.object = _.cloneDeep(changes.object.currentValue);
            if (!this.object) this.object = <iqs.shell.ControlObject>{};
            this.filterTypeCollection();
        }
    }

    private saveAvatar(callback: () => void) {
        if (this.picture) {

            this.picture.save(
                this.object.id,
                // Success callback
                callback,
                // Error callback
                (error) => {
                    console.error(error); // eslint-disable-line
                });
        }
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsObjectsViewModel.getTransaction();
    }

    public cancelClick() {
        this.edit = 'data';
        //this.iqsObjectsViewModel.selectedIndex = _.findIndex(this.iqsObjectsViewModel.getObjects(), { id: this.$location.search()['object_id'] })
        this.$location.search('edit', 'data');
        if (this.change) {
            this.change();
        }
    }

    public saveClick() {
        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (this.edit == 'edit') {
            this.iqsObjectsViewModel.updateObject(this.object, (item) => {
                this.saveAvatar(() => {
                    this.edit = 'data';
                    this.$location.search('edit', 'data');
                    this.$location.search('object_id', this.object.id);
                    if (this.change) {
                        this.change();
                    }
                });

            }, (err) => { })
        } else {
            this.object.org_id = this.iqsOrganization.orgId;
            this.iqsObjectsViewModel.saveObject(this.object, (item) => {
                this.object = item;
                this.$location.search('object_id', item.id);
                this.saveAvatar(() => {
                    this.edit = 'data';
                    this.$location.search('edit', 'data');
                    this.$location.search('object_id', item.id);
                    this.iqsObjectsViewModel.selectedIndex = _.findIndex(this.iqsObjectsViewModel.getObjects(), { id: this.$location.search()['object_id'] })
                    if (this.change) {
                        this.change();
                    }
                });

            }, (err) => { })
        }
        this.pipFormErrors.resetFormErrors(this.form, false);
    }

    public onPictureCreated(obj) {
        this.picture = obj.$control;
    };

    public onPictureChanged = function ($control) {

    };

    public onResetClick() {
        this.picture.reset();
    };

    public changePin() {
        if (!this.object) this.object = new iqs.shell.ControlObject();
        this.object.pin = "" + Math.round((Math.random() * (9999 - 1000) + 1000));
    }
}

(() => {
    angular
        .module('iqsConfigObjectEditPanel', ['ValidateDirectives'])
        .component('iqsObjectEditPanel', {
            bindings: ConfigObjectEditPanelBindings,
            templateUrl: 'config/objects/panels/ObjectsEditPanel.html',
            controller: ConfigObjectEditPanelController,
            controllerAs: '$ctrl'
        })
})();
