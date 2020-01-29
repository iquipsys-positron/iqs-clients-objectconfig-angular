export class EmergencyPlansModel {
    private _state: string;
    private _isSort: boolean;
    private _filter: any;
    private _mustOpened: iqs.shell.EmergencyPlan;

    private emergencyPlans: iqs.shell.EmergencyPlan[];
    private emergencyPlansFiltered: iqs.shell.EmergencyPlan[];
    private searchedCollection: string[];
    private selectIndex: number;
    private selectedItem: iqs.shell.EmergencyPlan;
    private transaction: pip.services.Transaction;
    private start: number = 0;
    private take: number = 100;
    private localSearch: string = null;

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsEmergencyPlansData: iqs.shell.IEmergencyPlansDataService
    ) {
        "ngInject";
        this.transaction = pipTransaction.create('emergencyPlan');
        this.emergencyPlans = [];
        // this.emergencyPlansFiltered = [];
        this.searchedCollection = [];
        this._mustOpened = null;
    }

    // private operation
    private updateItemInCollection(item: iqs.shell.EmergencyPlan): void {
        let index: number = _.findIndex(this.emergencyPlans, (ev) => {
            return ev.id == item.id;
        });

        // insert emergencyPlan without sort
        if (index > -1) {
            let sortNeed: boolean = item.name != this.emergencyPlans[index].name;
            this.emergencyPlans[index] = item;
            if (this.isSort && sortNeed) {
                this.sortCollection(this.emergencyPlans);
            }
            if (this.selectedItem) {
                if (this.selectedItem.id != item.id) {
                    this.selectItem(0);
                }
            } else {
                this.selectItem(index);
            }
        } else {
            if (this._isSort) {
                index = _.findIndex(this.emergencyPlans, (ev) => {
                    return ev.name.toLocaleLowerCase() > item.name.toLocaleLowerCase();
                });

                if (index > -1) {
                    this.emergencyPlans.splice(index, 0, item);
                } else {
                    this.emergencyPlans.push(item);
                    index = this.emergencyPlans.length - 1;
                }
            } else {
                this.emergencyPlans.unshift(item);
                index = 0;
            }
            // let search: string = this.localSearch;
            this.localSearch = '';

            this.getFiltered(this.localSearch);
            index = _.findIndex(this.emergencyPlansFiltered, (ev) => {
                return ev.id == item.id;
            });

            this.selectItem(index);
        }

        this.collectionChanged();
    }

    private collectionChanged() {
        // this.$timeout(() => {
            this.localSearch = null;
            this.setState();
        // }, 0);
        // send broadcast ???
    }

    private setState() {
        this.state = (this.emergencyPlansFiltered && this.emergencyPlansFiltered.length > 0) ? iqs.shell.States.Data : iqs.shell.States.Empty;
    }

    private prepareSearchedCollection() {
        this.searchedCollection = [];
        _.each(this.emergencyPlans, (item: iqs.shell.EmergencyPlan) => {
            this.searchedCollection.push(item.name.toLocaleLowerCase());
        });
    }

    private sortCollection(data: iqs.shell.EmergencyPlan[]): void {
        this.emergencyPlans = _.sortBy(data, function (item: iqs.shell.EmergencyPlan) {
            return item.name.toLocaleLowerCase();
        });
    }

    private onRead(data: iqs.shell.EmergencyPlan[], callback?: (data: iqs.shell.EmergencyPlan[]) => void): void {
        let index: number;
        if (data && data.length > 0) {
            if (this.isSort) {
                this.sortCollection(data);
            } else {
                this.emergencyPlans = data;
            }
            index = _.findIndex(this.emergencyPlans, (item: iqs.shell.EmergencyPlan) => {
                return item.id == this.$location.search()['emergency_plan_id'];
            });
            index = index > -1 ? index : 0;
        } else {
            this.emergencyPlans = [];
            this.searchedCollection = [];
            index = -1;
        }
        if (!this.localSearch) {
            this.emergencyPlansFiltered = this.emergencyPlans;
        }
        this.prepareSearchedCollection();

        this.selectItem(index);
        this.transaction.end();

        if (callback) {
            callback(this.emergencyPlans);
        }
        this.collectionChanged();
    }

    private getFiltered(localSearch?: string): iqs.shell.EmergencyPlan[] {
        let searchedCollection: iqs.shell.EmergencyPlan[] = [];

        // not filtered, return all collection
        if (!localSearch) {
            this.localSearch = null;
            this.emergencyPlansFiltered = this.emergencyPlans;
            this.selectItem();

            return this.emergencyPlansFiltered;
        }

        if (localSearch && localSearch != this.localSearch) {
            let searchQuery = localSearch.toLowerCase();
            searchedCollection = _.filter(this.emergencyPlans, (item: iqs.shell.EmergencyPlan) => {
                return item.name.toLowerCase().indexOf(searchQuery) > -1;
            });

            this.localSearch = localSearch;
            this.emergencyPlansFiltered = searchedCollection;
            this.selectItem();
        }

        return this.emergencyPlansFiltered;
    }

    private getFilter(): any {
        if (!this._filter || !angular.isObject(this._filter)) {
            this._filter = {};
        }

        if (!this._filter.org_id && this.iqsOrganization.orgId) {
            this._filter.org_id = this.iqsOrganization.orgId
        }

        return this._filter;
    }

    // CRUD operation
    public read(successCallback?: (data: iqs.shell.EmergencyPlan[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        this.transaction.begin('read');
        return this.iqsEmergencyPlansData.readEmergencyPlans(this.getFilter(),
            (response: iqs.shell.DataPage<iqs.shell.EmergencyPlan>) => {
                this.onRead(response.data, successCallback);
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Error: ' + JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public create(emergencyPlan: iqs.shell.EmergencyPlan, successCallback?: (data: iqs.shell.EmergencyPlan) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('create_emergencyPlan');
        this.iqsEmergencyPlansData.createEmergencyPlan(emergencyPlan,
            (data: iqs.shell.EmergencyPlan) => {
                this.state = iqs.shell.States.Data;
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Create emergencyPlan error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public delete(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('delete_emergencyPlan');
        let index: number;
        if (this.selectedItem && this.selectedItem.id == id) {
            index = this.selectIndex < this.emergencyPlansFiltered.length - 1 ? this.selectIndex : this.selectIndex - 1;
        } else {
            index = this.selectIndex;
        }

        this.iqsEmergencyPlansData.deleteEmergencyPlan(id,
            () => {
                this.remove(id);
                if (successCallback) {
                    successCallback();
                }
                this.selectItem(index);
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Delete emergencyPlan error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public update(id: string, emergencyPlan: iqs.shell.EmergencyPlan, successCallback?: (data: iqs.shell.EmergencyPlan) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('update_emergencyPlan');

        this.iqsEmergencyPlansData.updateEmergencyPlan(id, emergencyPlan,
            (data: iqs.shell.EmergencyPlan) => {
                this.state = iqs.shell.States.Data;
                this.$location.search('emergency_plan_id', data.id);
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Update emergencyPlan error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    // property

    public get mustOpened(): iqs.shell.EmergencyPlan {
        return this._mustOpened;
    }

    public set mustOpened(incident: iqs.shell.EmergencyPlan) {
        this._mustOpened = _.cloneDeep(incident);
    }

    public set filter(value: any) {
        this._filter = value;
    }

    public get filter(): any {
        return this._filter;
    }

    public get isSort(): boolean {
        return this._isSort;
    }

    public set isSort(value: boolean) {
        if (!!value) {
            this._isSort = value;
        }
    }

    public get state(): string {
        return this._state;
    }

    public set state(value: string) {
        if (value) {
            this._state = value;
        }
    }

    // data operation
    public get(localSearch?: string): iqs.shell.EmergencyPlan[] {
        let result = this.getFiltered(localSearch);
        this.setState();

        return result;
    }

    public getSearchedCollection(): string[] {
        return this.searchedCollection;
    }

    public getSelectedIndex(): number {
        return this.selectIndex;
    }

    public getSelectedItem(): iqs.shell.EmergencyPlan {
        return this.selectedItem;
    }

    public getTransaction(): pip.services.Transaction {
        return this.transaction;
    }

    public remove(id: string): void {
        _.remove(this.emergencyPlans, { id: id });
        _.remove(this.emergencyPlansFiltered, { id: id });
        this.collectionChanged();
    }

    public reload(successCallback?: (data: iqs.shell.EmergencyPlan[]) => void, errorCallback?: (error: any) => void) {
        this.emergencyPlans = new Array();
        this.emergencyPlansFiltered = new Array();
        this.state = iqs.shell.States.Progress;
        this.read(successCallback, errorCallback);
    }

    public selectItem(index?: number): void {
        if (index === undefined || index === null || index < 0 || index > this.emergencyPlansFiltered.length - 1) {
            if (this.$location.search()['emergency_plan_id']) {
                index = _.findIndex(this.emergencyPlansFiltered, (item: iqs.shell.EmergencyPlan) => {
                    return item.id == this.$location.search()['emergency_plan_id'];
                });
            }
            if (!index || index == -1) {
                index = 0;
            }
        }

        this.selectIndex = index;

        this.selectedItem = (this.emergencyPlansFiltered && this.emergencyPlansFiltered.length > 0) ? this.emergencyPlansFiltered[index] : undefined;
        if (this.selectedItem) {
            this.$location.search('emergency_plan_id', this.selectedItem.id);
        }

    }

    public selectItemById(id: string): void {
        let index: number;
        if (!id) {
            index = 0;
        } else {
            index = _.findIndex(this.emergencyPlans, { id: id });
            index = index > -1 ? index : 0;
        }

        this.selectItem(index);
    }

    public clean(): void {
        this.emergencyPlans = [];
        this.emergencyPlansFiltered = [];
        this.searchedCollection = [];
        this.selectIndex = -1;
        this.selectedItem = null;
        this.state = iqs.shell.States.Empty;
    }

}
