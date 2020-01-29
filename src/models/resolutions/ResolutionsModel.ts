export let UpdateResolutionEvent = 'iqsUpdateResolutionEntity';

export class ResolutionsModel {
    private _state: string;
    private _isSort: boolean;
    private _filter: any;

    private resolutions: iqs.shell.Resolution[];
    private resolutionsFiltered: iqs.shell.Resolution[];
    private searchedCollection: string[];
    private selectIndex: number;
    private selectedItem: iqs.shell.Resolution;
    private transaction: pip.services.Transaction;
    private localSearch: string = null;

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsResolutionData: iqs.shell.IResolutionsDataService
    ) {
        "ngInject";
        this.transaction = pipTransaction.create('RESOLUTIONS');
        this.resolutions = [];
        this.searchedCollection = [];
    }

    // private operation
    private updateItemInCollection(item: iqs.shell.Resolution): void {
        let index: number = _.findIndex(this.resolutions, (ev) => {
            return ev.id == item.id;
        });

        // insert event without sort
        if (index > -1) {
            let sortNeed: boolean = item.resolution != this.resolutions[index].resolution;
            this.resolutions[index] = item;
            if (this.isSort && sortNeed) {
                this.sortCollection(this.resolutions);
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
                index = _.findIndex(this.resolutions, (ev: iqs.shell.Resolution) => {
                    return ev.resolution.toLocaleLowerCase() > item.resolution.toLocaleLowerCase();
                });
                if (index > -1) {
                    this.resolutions.splice(index, 0, item);
                } else {
                    this.resolutions.push(item);
                    index = this.resolutions.length - 1;
                }
            } else {
                this.resolutions.unshift(item);
                index = 0;
            }

            this.selectItem(index);
        }

        this.collectionChanged();
    }

    private collectionChanged() {
        // this.$timeout(() => {
            this.setState();
        // }, 10);
        // send broadcast ???
    }

    private setState() {
        this.state = (this.resolutionsFiltered && this.resolutionsFiltered.length > 0) ? iqs.shell.States.Data : iqs.shell.States.Empty;
    }

    private prepareSearchedCollection() {
        this.searchedCollection = [];
        _.each(this.resolutions, (item: iqs.shell.Resolution) => {
            this.searchedCollection.push(item.resolution.toLocaleLowerCase());
        });
    }

    private sortCollection(data: iqs.shell.Resolution[]): void {
        this.resolutions = _.sortBy(data, function (item: iqs.shell.Resolution) {
            return item.resolution.toLocaleLowerCase();
        });
    }

    private onRead(data: iqs.shell.Resolution[], callback?: (data: iqs.shell.Resolution[]) => void): void {
        let index: number;
        if (data && data.length > 0) {
            if (this.isSort) {
                this.sortCollection(data);
            } else {
                this.resolutions = data;
            }
            index = _.findIndex(this.resolutions, (item: iqs.shell.Resolution) => {
                return item.id == this.$location.search()['resolution_id'];
            });
            index = index > -1 ? index : 0;
        } else {
            this.resolutions = [];
            this.searchedCollection = [];
            index = -1;
        }
        if (!this.localSearch) {
            this.resolutionsFiltered = this.resolutions;
        }
        this.prepareSearchedCollection();

        this.selectItem(index);
        this.transaction.end();

        this.collectionChanged();
        if (callback) {
            callback(this.resolutions);
        }

    }

    private getFiltered(localSearch?: string): iqs.shell.Resolution[] {
        let searchedCollection: iqs.shell.Resolution[] = [];

        // not filtered, return all collection
        if (!localSearch) {
            this.localSearch = null;
            this.resolutionsFiltered = this.resolutions;
            this.selectItem();

            return this.resolutions;
        }

        if (localSearch && localSearch != this.localSearch) {
            let searchQuery = localSearch.toLocaleLowerCase();
            searchedCollection = _.filter(this.resolutions, (item: iqs.shell.Resolution) => {
                return item.resolution.toLowerCase().indexOf(searchQuery) > -1;
            });

            this.localSearch = localSearch;
            this.resolutionsFiltered = searchedCollection;
            this.selectItem();
        }

        return this.resolutionsFiltered;
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
    public read(successCallback?: (data: iqs.shell.Resolution[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        this.transaction.begin('READ_RESOLUTION');
        return this.iqsResolutionData.readResolutions(this.getFilter(),
            (response: iqs.shell.DataPage<iqs.shell.Resolution>) => {
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

    public create(resolutions: iqs.shell.Resolution, successCallback?: (data: iqs.shell.Resolution) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('CREATE_RESOLUTION');
        this.iqsResolutionData.createResolution(resolutions,
            (data: iqs.shell.Resolution) => {
                this.state = iqs.shell.States.Data;
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Create resolution error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public delete(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('DELETE_RESOLUTION');
        let index: number;
        if (this.selectedItem && this.selectedItem.id == id) {
            index = this.selectIndex < this.resolutionsFiltered.length - 1 ? this.selectIndex : this.selectIndex - 1;
        } else {
            index = this.selectIndex;
        }

        this.iqsResolutionData.deleteResolution(id,
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
                this.$log.error('Delete resolution error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }


    public update(id: string, resolutions: iqs.shell.Resolution, successCallback?: (data: iqs.shell.Resolution) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('UPDATE_RESOLUTION');

        this.iqsResolutionData.updateResolution(id, resolutions,
            (data: iqs.shell.Resolution) => {
                this.state = iqs.shell.States.Data;
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Update resolution error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    // property

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
    public get(localSearch?: string): iqs.shell.Resolution[] {
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

    public getSelectedItem(): iqs.shell.Resolution {
        return this.selectedItem;
    }

    public getTransaction(): pip.services.Transaction {
        return this.transaction;
    }

    public remove(id: string): void {
        _.remove(this.resolutions, { id: id });
        _.remove(this.resolutionsFiltered, { id: id });
        this.collectionChanged();
    }

    public reload(successCallback?: (data: iqs.shell.Resolution[]) => void, errorCallback?: (error: any) => void) {
        this.resolutions = new Array();
        this.resolutionsFiltered = new Array();
        this.state = iqs.shell.States.Progress;
        this.read(successCallback, errorCallback);
    }

    public selectItem(index?: number): void {
        if (index === undefined || index === null || index < 0 || index > this.resolutions.length - 1) {
            if (this.$location.search()['resolution_id']) {
                index = _.findIndex(this.resolutions, (item: iqs.shell.Resolution) => {
                    return item.id == this.$location.search()['resolution_id'];
                });
            }
            if (!index || index == -1) {
                index = 0;
            }
        }

        this.selectIndex = index;

        this.selectedItem = (this.resolutions && this.resolutions.length > 0) ? this.resolutions[index] : undefined;
        if (this.selectedItem) {
            this.$location.search('resolution_id', this.selectedItem.id);
        }
    }

    public getResolutionsByEventRuleId(ruleId: string): iqs.shell.Resolution[] {
        return _.filter(this.resolutions, (r: iqs.shell.Resolution) => {
            return r.rule_ids && r.rule_ids.indexOf(ruleId) > -1 || !r.rule_ids || r.rule_ids && r.rule_ids.length == 0;
        }) || [];
    }

    public getResolutionsByName(resolution: string): iqs.shell.Resolution {
        if (!resolution) return null;

        let searchQuery = resolution.toLocaleLowerCase();
        let resolutionIndex: number = _.findIndex(this.resolutions, (r: iqs.shell.Resolution) => {
            return r.resolution && r.resolution.toLocaleLowerCase() === searchQuery;
        });

        return resolutionIndex > -1 ? this.resolutions[resolutionIndex] : null;
    }

    public clean(): void {
        this.resolutions = [];
        this.resolutionsFiltered = [];
        this.searchedCollection = [];
        this.selectIndex = -1;
        this.selectedItem = null;
        this.state = iqs.shell.States.Empty;
    }
}
