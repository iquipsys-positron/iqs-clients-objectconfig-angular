import { IAddDeviceDialogService, IAddEqupmentDialogService } from '../../../common';
import { IStatusService } from '../../../services';

interface IConfigObjectsInformationPanelBindings {
    [key: string]: any;
    object: any;
    type: any;
    editable: any;
    currentStateFunc: any;
}

const ConfigObjectsInformationPanelBindings: IConfigObjectsInformationPanelBindings = {
    object: '<iqsObject',
    type: '<iqsType',
    currentStateFunc: '<iqsCurrent',
    editable: '<iqsEditable'
}

class ConfigObjectsInformationPanelChanges implements ng.IOnChangesObject, IConfigObjectsInformationPanelBindings {
    [key: string]: ng.IChangesObject<any>;
    object: ng.IChangesObject<any>;
    type: ng.IChangesObject<string>;
    editable: ng.IChangesObject<boolean>;
    currentStateFunc: ng.IChangesObject<() => void>;
}

class ConfigObjectsInformationPanelController implements ng.IController {
    public $onInit() { }
    public object: iqs.shell.ControlObject;
    public type: string;
    public categoryCollection: iqs.shell.TypeCollection;
    public typeCollection: iqs.shell.TypeCollection;
    public deviceCollection: iqs.shell.TypeCollection;
    public editable: boolean;
    public currentStateFunc: Function;
    public objectGroups: iqs.shell.ObjectGroup[];
    private promise: any;
    public accessConfig: any;
    public car: iqs.shell.ControlObject;
    public device: iqs.shell.Device;
    private cf: Function[] = [];

    constructor(
        $scope: ng.IScope,
        $rootScope: ng.IRootScopeService,
        private $interval: ng.IIntervalService,
        private $location: ng.ILocationService,
        private $state: ng.ui.IStateService,
        private iqsAddDeviceDialog: IAddDeviceDialogService,
        private iqsDevicesViewModel: iqs.shell.IDevicesViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        iqsTypeCollectionsService: iqs.shell.ITypeCollectionsService,
        private pipConfirmationDialog: pip.dialogs.IConfirmationDialogService,
        private pipTranslate: pip.services.ITranslateService,
        public iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        private iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
        public iqsStatusService: IStatusService,
        private iqsAccessConfig: iqs.shell.IAccessConfigService,
        private iqsAddEqupmentDialog: IAddEqupmentDialogService,
        private iqsLoading: iqs.shell.ILoadingService
    ) {
        "ngInject";

        this.accessConfig = iqsAccessConfig.getStateConfigure().access;
        const runWhenReady = () => {
            this.promise = $interval(() => {
                this.updateObject();
            }, 10000);

            iqsTypeCollectionsService.init();
            this.typeCollection = iqsTypeCollectionsService.getObjectType();
            this.categoryCollection = iqsTypeCollectionsService.getObjectCategory();
            this.deviceCollection = iqsTypeCollectionsService.getDeviceType();

            this.editable = this.editable || false;
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady));
    }

    public $onDestroy() {
        this.$interval.cancel(this.promise);
        for (const f of this.cf) { f(); }
    }

    public $onChanges(changes: ConfigObjectsInformationPanelChanges) {
        if (changes.object && changes.object.currentValue) {
            this.object = _.cloneDeep(changes.object.currentValue);
        }
        this.updateObject();
    }

    private setDevice(): void {
        this.device = this.object && this.object.device_id ? this.iqsDevicesViewModel.getDeviceById(this.object.device_id) :
            this.iqsDevicesViewModel.getDeviceById(this.object.device_id);
    }

    private setCar(): void {
        this.car = this.iqsObjectsViewModel.getObjectById(this.object.perm_assign_id);
    }

    public updateObject() {
        this.objectGroups = [];
        _.each(this.object.group_ids, (id: string) => {
            let group: iqs.shell.ObjectGroup = this.iqsObjectGroupsViewModel.getGroupById(id);
            if (group) {
                this.objectGroups.push(group);
            }
        });
        this.objectGroups = _.sortBy(this.objectGroups, (g: iqs.shell.ObjectGroup) => {
            return g.name ? g.name.toLocaleLowerCase() : '';
        });

        this.setDevice();
        this.setCar();
    }

    public get transaction(): pip.services.Transaction {
        return this.iqsObjectsViewModel.getTransaction();
    }

    public changeDevice(id: string) {
        this.iqsAddDeviceDialog.show({ device_id: id, showFree: true }, (id: string) => {
            this.object.device_id = id;
            this.setDevice();
            this.iqsObjectsViewModel.updateObject(this.object, () => {
                this.iqsDevicesViewModel.read();
                this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('data');

                let device: iqs.shell.Device = this.iqsDevicesViewModel.getDeviceById(id);
                let name = device.label || device.udi;
                if (device && device.status != iqs.shell.DeviceStatus.Active) {
                    this.pipConfirmationDialog.show(
                        {
                            event: null,
                            title: name ? this.pipTranslate.translate('DEVICE_ENABLE_CONFIRMATION_TITLE') + ' "' + name + '"?' : this.pipTranslate.translate('DEVICE_ENABLE_CONFIRMATION_TITLE') + '?',
                            ok: 'DEVICE_ENABLE',
                            cancel: 'CANCEL'
                        },
                        () => {
                            device.status = iqs.shell.DeviceStatus.Active;
                            device.object_id = this.object.id;
                            this.iqsDevicesViewModel.updateDevice(
                                device,
                                (item) => { },
                                (err) => { })
                        });
                }
            });
        });
    }

    public deviceClick() {
        this.$location.search('device_id', this.object.device_id);
        // this.$state.go('app.devices', { device_id: this.object.device_id });
        window.location.href = window.location.origin + '/config_devices/index.html#/devices?device_id=' + this.object.device_id;
    }

    public deleteClick() {
        let id: string = this.object.device_id
        this.object.device_id = null;
        this.iqsObjectsViewModel.updateObject(this.object, () => {
            this.iqsDevicesViewModel.read();
            this.setDevice();
            this.iqsCurrentObjectStatesViewModel.initCurrentObjectStates('data');
        });
    }

    public carClick() {
        this.$location.search('object_id', this.object.perm_assign_id);
        this.$state.go('app.objects', { object_id: this.object.perm_assign_id });
        let index: number = _.findIndex(this.iqsObjectsViewModel.getObjects(), { id: this.object.perm_assign_id });
        if (index != -1) {
            this.iqsObjectsViewModel.selectedIndex = index;
            this.currentStateFunc();
        }
    }

    public deleteCarClick() {
        if (this.object) {
            this.object.perm_assign_id = null;
            this.iqsObjectsViewModel.updateObject(this.object);
            this.setCar();
        }
    }

    public changeCar(id: string) {
        this.iqsAddEqupmentDialog.show({
            equipment_id: id
        }, (id: string) => {
            this.object.perm_assign_id = id;
            this.iqsObjectsViewModel.updateObject(this.object);
            this.setCar();
        })
    }

}

(() => {

    const translateConfig = function (pipTranslateProvider) {
        // Set translation strings for the module
        pipTranslateProvider.translations('en', {
            "CONFIG_INFO_ADD_TRACKER": 'Attached tracker',
            "CONFIG_INFO_CHANGE_DEVICE": 'Change',
            "CONFIG_INFO_DETAILS": "Details",
            "CONFIG_INFO_EMPTY_DEVICE": "This object has no attached tracker",
            "CONFIG_INFO_ADD_DEVICE": 'Attach tracker',
            'CONFIG_INFO_DELETE_DEVICE': 'Detach',

            "CONFIG_INFO_TITLE_ADD_CAR": 'Permanently assigned to',
            "CONFIG_INFO_CHANGE_CAR": 'Change',
            "CONFIG_INFO_EMPTY_CAR": 'Permanent assignment is not set',
            "CONFIG_INFO_ADD_CAR": 'Assign equipment or asset',
            CONFIG_INFO_DELETE_CAR: 'Unassign',
            CONFIG_INFO_CONNECT: 'Online',
            CONFIG_INFO_INCONNECT: 'Offline',

            "CONFIG_INFO_TITLE_ADD_OBJECT": 'Attached object',
            "CONFIG_INFO_CHANGE_OBJECT": 'Change',
            "CONFIG_INFO_EMPTY_OBJECT": 'Attached object was not found',
            "CONFIG_INFO_ADD_OBJECT": 'Attach object',
            CONFIG_INFO_DELETE_OBJECT: 'Detach'
        });

        pipTranslateProvider.translations('ru', {

            "CONFIG_INFO_ADD_TRACKER": 'Прикреплен трекер',
            "CONFIG_INFO_CHANGE_DEVICE": 'Редактировать',
            "CONFIG_INFO_DETAILS": "Подробнее",
            "CONFIG_INFO_EMPTY_DEVICE": "У данного объекта нет прикрепленного трекера",
            "CONFIG_INFO_ADD_DEVICE": 'Прикрепить трекер',
            'CONFIG_INFO_DELETE_DEVICE': 'Отсоединить',

            "CONFIG_INFO_TITLE_ADD_CAR": 'Постоянно назначен на',
            "CONFIG_INFO_CHANGE_CAR": 'Редактировать',
            "CONFIG_INFO_EMPTY_CAR": 'Назначение отсутствует',
            "CONFIG_INFO_ADD_CAR": 'Назначить машину или механизм',
            CONFIG_INFO_DELETE_CAR: 'Отсоединить',
            CONFIG_INFO_CONNECT: 'На связи',
            CONFIG_INFO_INCONNECT: 'Отключен'
        });
    }

    angular
        .module('iqsConfigObjectsInformationPanel', [
            'iqsAddDeviceDialog',
            'iqsAddEqupmentDialog',
            'iqsStatus'
        ])
        .component('iqsObjectsInformationPanel', {
            bindings: ConfigObjectsInformationPanelBindings,
            templateUrl: 'config/objects/panels/ObjectsInformationPanel.html',
            controller: ConfigObjectsInformationPanelController,
            controllerAs: '$ctrl'
        })
        .config(translateConfig)

})();
