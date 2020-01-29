import { InvitationsModel } from './InvitationsModel';
import { IInvitationsViewModel } from './IInvitationsViewModel';

class InvitationsViewModel implements IInvitationsViewModel {
    public model: InvitationsModel;

    constructor(
        $location: ng.ILocationService,
        iqsInvitationsData: iqs.shell.IInvitationsDataService,
        iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        pipTransaction: pip.services.ITransactionService
    ) {

        this.model = new InvitationsModel($location, iqsInvitationsData, iqsObjectsViewModel, pipTransaction);
    }

    public initInvitations(filter?: string, successCallback?: (data: iqs.shell.Invitation[]) => void, errorCallback?: (error: any) => void) {
        this.model.getInvitations(filter || 'all', successCallback, errorCallback);
    }

    public filterInvitations(filter: string = 'all') {
        this.model.filterInvitations(filter);
    }

    public get invitations() {
        return this.model.invitations;
    }

    public get allInvitations() {
        return this.model.allInvitations;
    }

    public selectItem(index?: number) {
        this.model.selectItem(index);

    }

    public getTransaction(): pip.services.Transaction {
        return this.model.getTransaction();
    }

    public get state(): string {
        return this.model.state;
    }

    public set state(state: string) {
        this.model.state = state;
    }

    public get selectedIndex(): number {
        return this.model.selectedIndex;
    }

    public set selectedIndex(index: number) {
        this.model.selectedIndex = index;
    }

    public getInvitationById(invitationId: string): iqs.shell.Invitation {
        return this.model.getInvitationById(invitationId)
    }

    public saveInvitation(data: iqs.shell.Invitation, callback: (item: iqs.shell.Invitation) => void, error: (err: any) => void) {
        this.model.saveInvitation(data, callback, error);
    }

    public deleteInvitation(id, callback: () => void, error: (error: any) => void) {
        this.model.deleteInvitation(id, callback, error);
    }

    public updateInvitation(data: iqs.shell.Invitation, callback: (item: iqs.shell.Invitation) => void, error: (err: any) => void) {
        this.model.updateInvitation(data, callback, error);
    }

    public filterWithArrayObjects(objects: iqs.shell.SearchResult[]) {
        this.model.filterWithArrayObjects(objects);
    }

    public sendNotifyMessage(data: iqs.shell.Invitation, callback?:(item?: iqs.shell.Invitation) => void, errorCallback?: (err: any) => void) {
        this.model.sendNotifyMessage(data, callback, errorCallback);
    }

    public resendInvite(data, callback?: (item) => void, errorCallback?: (err) => void) {
        this.model.resendInvite(data, callback, errorCallback);
    }
    
    public approveInvite(data, callback?: (item) => void, errorCallback?: (err) => void) {
        this.model.approveInvite(data, callback, errorCallback);
    }
    
    public denyInvite(data, callback?: (item) => void, errorCallback?: (err) => void) {
        this.model.denyInvite(data, callback, errorCallback);
    }

    public clean(): void {
        this.model.clean();
    }
}

angular.module('iqsInvitations.ViewModel', ['iqsInvitations.Data'])
    .service('iqsInvitationsViewModel', InvitationsViewModel);