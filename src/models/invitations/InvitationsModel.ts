export class InvitationParams {
    skip: number = 0;
    total: boolean = true;
    size: number = 100;
    action?: string;
}

export class InvitationsModel {
    public state: string;
    public allInvitations: iqs.shell.Invitation[];
    public invitations: iqs.shell.Invitation[];
    public selectedIndex: number;
    private selectedItem: iqs.shell.Invitation;
    private readonly THRESHOLD: number = 15 * 60 * 1000; // 15 min
    private transaction: pip.services.Transaction;
    constructor(
        private $location: ng.ILocationService,
        private iqsInvitationsData: iqs.shell.IInvitationsDataService,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private pipTransaction: pip.services.ITransactionService
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('Invintation');
    }

    private sortCollection(data: iqs.shell.Invitation[]): iqs.shell.Invitation[] {
        let collection = _.sortBy(data, function (item: iqs.shell.Invitation) {
            return item.create_time ? -1 * moment(item.create_time).valueOf() : 0;
        });

        return collection;
    }

    private setState() {
        this.state = (this.invitations && this.invitations.length > 0) ? iqs.shell.States.Data : iqs.shell.States.Empty;
    }

    public getInvitations(filter: string, successCallback?: (data: iqs.shell.Invitation[]) => void, errorCallback?: (error: any) => void) {
        this.state = iqs.shell.States.Progress;
        let params: InvitationParams = new InvitationParams();
        this.transaction.begin('read');
        this.iqsInvitationsData.readInvitations(
            params,
            (data: iqs.shell.DataPage<iqs.shell.Invitation>) => {
                this.getInvitationsCallback(data, filter, successCallback);
            },
            (error: any) => {
                this.transaction.end(error);
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public getTransaction(): pip.services.Transaction {
        return this.transaction;
    }

    public selectItem(index?: number) {
        if (index === undefined || index === null || index < 0 || index > this.invitations.length - 1) {
            let id: string = this.$location.search()['invitation_id'];
            if (id) {
                index = _.findIndex(this.invitations, (item: iqs.shell.Invitation) => {
                    return item.id == id;
                });
            }
            if (!index || index == -1) {
                index = 0;
            }
        }

        if (this.invitations.length > index) {
            this.selectedIndex = index;
        } else {
            this.selectedIndex = 0;
        }

        this.selectedIndex = index;

        this.selectedItem = (this.invitations && this.invitations.length > 0) ? this.invitations[index] : undefined;
        if (this.selectedItem) {
            this.$location.search('invitation_id', this.selectedItem.id);
        }
    }

    public filterInvitations(filter: string = 'all') {
        this.invitations = this.allInvitations;
        this.setState();
    }

    public filterWithArrayObjects(objects: iqs.shell.SearchResult[]) {
        this.invitations = _.filter(this.invitations, (item: iqs.shell.Invitation) => {
            return _.findIndex(objects, { id: item.id }) != -1 ? true : false;
        })
        this.setState();
    }

    public getInvitationById(invitationId: string) {
        return _.find(this.allInvitations, (invitation) => { return invitation.id === invitationId; });
    }

    private getInvitationsCallback(data: iqs.shell.DataPage<iqs.shell.Invitation>, filter?: string, successCallback?: (data: iqs.shell.Invitation[]) => void) {
        this.allInvitations = this.sortCollection(data.data);
        this.filterInvitations(filter);
        this.selectItem();
        this.transaction.end();
        if (successCallback) {
            successCallback(this.allInvitations);
        }
    }

    public saveInvitation(data: iqs.shell.Invitation, callback?: (item: iqs.shell.Invitation) => void, errorCallback?: (err: any) => void) {
        this.transaction.begin('create_invintation');
        this.iqsInvitationsData.saveInvitation(
            data,
            (item: iqs.shell.Invitation) => {
                this.invitations.push(item);
                this.invitations = this.sortCollection(this.invitations);
                this.allInvitations.push(item);
                this.allInvitations = this.sortCollection(this.allInvitations);
                this.$location.search('invitation_id', item.id);
                this.state = iqs.shell.States.Data;
                this.selectItem();
                this.transaction.end();
                if (callback) {
                    callback(item);
                }
            },
            (err: any) => {
                this.transaction.end(err);
                if (errorCallback) {
                    errorCallback(err);
                }
            })
    }

    public remove(id: string): void {
        _.remove(this.invitations, { id: id });
        _.remove(this.allInvitations, { id: id });
        this.setState();
    }

    public deleteInvitation(id: string, callback?: () => void, errorCallback?: (error: any) => void) {
        this.transaction.begin('delete_invintation');
        let index: number;
        if (this.selectedItem && this.selectedItem.id == id) {
            index = this.selectedIndex < this.invitations.length - 1 ? this.selectedIndex : this.selectedIndex - 1;
        } else {
            index = this.selectedIndex;
        }
        this.iqsInvitationsData.deleteInvitation(id,
            (item) => {
                this.remove(id);
                this.selectItem(index);
                this.transaction.end();
                if (callback) {
                    callback();
                }
            },
            (err: any) => {
                this.transaction.end(err);
                if (errorCallback) {
                    errorCallback(err);
                }
            })
    }

    public resendInvite(data, callback?: (item) => void, errorCallback?: (err) => void) {
        this.transaction.begin('resendInvite');
        this.iqsInvitationsData.resendInvitation(
            data,
            (data) => {
                this.transaction.end();
                if (callback) {
                    callback(data)
                }
            }, (err) => {
                this.transaction.end(err);
                if (errorCallback) {
                    errorCallback(err);
                }
            });
    }

    public sendNotifyMessage(data: iqs.shell.Invitation, callback?: (item?: iqs.shell.Invitation) => void, errorCallback?: (err: any) => void) {
        this.transaction.begin('send_approve_notify');
        this.iqsInvitationsData.sendNotifyMessage(
            data,
            (data?: iqs.shell.Invitation) => {
                this.transaction.end();
                if (callback) {
                    callback(data)
                }
            },
            (err: any) => {
                this.transaction.end(err);
                if (errorCallback) {
                    errorCallback(MediaStreamError);
                }
            });
    }

    public approveInvite(data, callback?: (item) => void, errorCallback?: (err) => void) {
        this.transaction.begin('approveInvite');
        this.iqsInvitationsData.approveInvitation(data, (data) => {
            this.transaction.end();
            if (callback) {
                callback(data)
            }
        }, (err) => {
            this.transaction.end(err);
            if (errorCallback) {
                errorCallback(err);
            }
        })
    }

    public denyInvite(data, callback?: (item) => void, errorCallback?: (err) => void) {
        this.transaction.begin('denyInvite');
        this.iqsInvitationsData.denyInvitation(data, (data) => {
            this.transaction.end();
            if (callback) {
                callback(data)
            }
        }, (err) => {
            this.transaction.end(err);
            if (errorCallback) {
                errorCallback(err);
            }
        })
    }

    public updateInvitation(data: iqs.shell.Invitation, callback?: (item) => void, errorCallback?: (err) => void) {
        this.transaction.begin('updateInvitation');
        this.iqsInvitationsData.updateInvitation(data.id, data,
            (item: iqs.shell.Invitation) => {
                let index: number = _.findIndex(this.invitations, { id: item.id });
                if (index > -1) {
                    this.invitations[index] = item;
                }

                index = _.findIndex(this.allInvitations, { id: item.id });
                if (index > -1) {
                    this.allInvitations[index] = item;
                }

                this.$location.search('invitation_id', item.id);
                this.selectItem();
                this.transaction.end();
                if (callback) {
                    callback(item);
                }
            },
            (err: any) => {
                this.transaction.end(err);
                if (errorCallback) {
                    errorCallback(err);
                }
            })
    }

    public clean(): void {
        this.invitations = [];
        this.allInvitations = [];
        this.state = iqs.shell.States.Empty;
        this.selectedIndex = -1;
    }
}