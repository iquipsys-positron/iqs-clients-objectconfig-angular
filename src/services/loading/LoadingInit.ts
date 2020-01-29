import { IInvitationsViewModel }
    from '../../models';

function initPopulating(
    iqsCurrentObjectStatesViewModel: iqs.shell.ICurrentObjectStatesViewModel,
    iqsStatesViewModel: iqs.shell.IStatesViewModel,
    iqsShiftsViewModel: iqs.shell.IShiftsViewModel,
    iqsEventRulesViewModel: iqs.shell.IEventRulesViewModel,
    iqsAccountsViewModel: iqs.shell.IAccountsViewModel,
    iqsInvitationsViewModel: IInvitationsViewModel,
    iqsMapViewModel: iqs.shell.IMapViewModel,
    iqsMapConfig: iqs.shell.IMapService,
    pipIdentity: pip.services.IIdentityService,
    iqsLoading: iqs.shell.ILoadingService,
    iqsOrganization: iqs.shell.IOrganizationService
) {
    iqsLoading.push('data', [
        iqsCurrentObjectStatesViewModel.clean.bind(iqsCurrentObjectStatesViewModel),
        iqsStatesViewModel.clean.bind(iqsStatesViewModel),
        iqsShiftsViewModel.clean.bind(iqsShiftsViewModel),
        iqsEventRulesViewModel.clean.bind(iqsEventRulesViewModel),
        iqsAccountsViewModel.clean.bind(iqsAccountsViewModel),
        iqsInvitationsViewModel.clean.bind(iqsInvitationsViewModel),
        iqsMapConfig.clean.bind(iqsMapConfig)
    ], async.parallel, [
            (callback) => {
                iqsStatesViewModel.cleanUpAllStates();
                iqsStatesViewModel.initStates(new Date().toISOString(), 'all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsShiftsViewModel.initShifts('all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsEventRulesViewModel.filter = null;
                iqsEventRulesViewModel.isSort = true;
                iqsEventRulesViewModel.reload(
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsAccountsViewModel.initAccounts(
                    'all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsInvitationsViewModel.initInvitations(
                    'all',
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsMapConfig.clean();
                iqsMapConfig.orgId = iqsOrganization.orgId;
                iqsMapViewModel.initMap(
                    () => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            }
        ]);
    if (pipIdentity.identity && pipIdentity.identity.id) {
        iqsLoading.start();
    }
}


let m: any;
const requires = [
    'iqsCurrentObjectStates.ViewModel',
    'iqsStates.ViewModel',
    'iqsShifts.ViewModel',
    'iqsEventRules.ViewModel',
    'iqsAccounts.ViewModel',
    'iqsInvitations.ViewModel',
    'iqsMap.ViewModel',
    'iqsMapConfig',
    'iqsOrganizations.Service',
];

try {
    m = angular.module('iqsLoading');
    m.requires.push(...requires);
    m.run(initPopulating);
} catch (err) { }