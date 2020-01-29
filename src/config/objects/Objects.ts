export const ConfigObjectsStateName: string = 'app.objects';

class ConfigObjectsController implements ng.IController {
    public $onInit() { }

    constructor(
        private $window: ng.IWindowService,
    ) {
        "ngInject";
       
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureConfigObjectsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigObjectsStateName, {
            url: '/objects?object_id&type&details&section&edit',
            reloadOnSearch: false,
            controller: ConfigObjectsController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/objects/Objects.html'
        });
}

function configureConfigObjectsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {
        addObject: iqs.shell.AccessRole.manager,
        editObject: iqs.shell.AccessRole.manager,
        deleteObject: iqs.shell.AccessRole.manager
    }
    iqsAccessConfigProvider.registerStateAccess(ConfigObjectsStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigObjectsStateName, accessConfig);
}

(() => {

    angular
        .module('iqsConfigObjects', ['pipNav', 'iqsConfigObjectsPanel'])
        .config(configureConfigObjectsRoute)
        .config(configureConfigObjectsAccess);
})();
