export const ConfigGroupsStateName: string = 'app.groups';

class ConfigGroupsController implements ng.IController {
    public $onInit() { }
    public details: boolean;

    constructor(
        private $window: ng.IWindowService,
    ) {
        "ngInject";
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureConfigGroupsRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(ConfigGroupsStateName, {
            url: '/groups?group_id&edit&status&details',
            reloadOnSearch: false,
            controller: ConfigGroupsController,
            auth: true,
            controllerAs: '$ctrl',
            templateUrl: 'config/groups/Groups.html'
        });
}

function configureConfigGroupsAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.manager;
    let accessConfig: any = {
        addGroup: iqs.shell.AccessRole.manager,
        editGroup: iqs.shell.AccessRole.manager,
        deleteGroup: iqs.shell.AccessRole.manager
    }
    iqsAccessConfigProvider.registerStateAccess(ConfigGroupsStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(ConfigGroupsStateName, accessConfig);
}

(() => {
    angular
        .module('iqsConfigGroups', [
            'pipNav',
            'iqsObjectGroups.Data',
            'iqsConfigGroupsPanel'
        ])
        .config(configureConfigGroupsRoute)
        .config(configureConfigGroupsAccess);
})();
