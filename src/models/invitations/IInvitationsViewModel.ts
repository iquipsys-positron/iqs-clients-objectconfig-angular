export interface IInvitationsViewModel {
    initInvitations(filter?: string, successCallback?: (data: iqs.shell.Invitation[]) => void, errorCallback?: (error: any) => void);
    filterInvitations(filter: string);
    selectItem(index?: number);
    getInvitationById(invitationId: string): iqs.shell.Invitation;
    saveInvitation(data: iqs.shell.Invitation, callback: (item: iqs.shell.Invitation) => void, error: (err: any) => void);
    updateInvitation(data: iqs.shell.Invitation, callback: (item: iqs.shell.Invitation) => void, error: (err: any) => void);
    deleteInvitation(id, callback: () => void, error: (error: any) => void);
    filterWithArrayObjects(objects: iqs.shell.SearchResult[]);
    sendNotifyMessage(data: iqs.shell.Invitation, callback?: (item?: iqs.shell.Invitation) => void, errorCallback?: (err: any) => void);
    resendInvite(data, callback?: (item) => void, errorCallback?: (err) => void);
    approveInvite(data, callback?: (item) => void, errorCallback?: (err) => void);
    denyInvite(data, callback?: (item) => void, errorCallback?: (err) => void);
    clean(): void;
    getTransaction(): pip.services.Transaction;
    state: string;
    selectedIndex: number;
    invitations: iqs.shell.Invitation[];
    allInvitations: iqs.shell.Invitation[];
}
