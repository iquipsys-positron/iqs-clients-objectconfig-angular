import './InvitationsModel';
import './InvitationsViewModel';

let m: any;

try {
    m = angular.module('iqsInvitations');
    m.requires.push(...[
        'iqsInvitations.ViewModel'
    ]);
} catch (err) { }

export * from './IInvitationsViewModel';
