export class AssocietedObject {
    [key: string]: string;;
}

export class CreditCardsModel {
    private _state: string;
    private _filter: any;
    private _isSort: boolean;
    private _selectAllow: boolean;
    private expectedString = 'CREDIT_CARD_EXPECTED';

    private creditCards: iqs.shell.CreditCard[];
    private creditCardsFiltered: iqs.shell.CreditCard[];
    private localFilters: any = null; // todo
    private _search: string = null; // todo

    private _selectIndex: number;
    private selectedItem: iqs.shell.CreditCard;
    private transaction: pip.services.Transaction;
    private _selectedIndex: number;
    private _take: number = 100;

    private _defaultCollection: string[];
    private _searchedCollection: string[];

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private pipTransaction: pip.services.ITransactionService,
        private pipIdentity: pip.services.IIdentityService,
        private iqsCreditCardsData: iqs.shell.ICreditCardsDataService,
        private iqsAccountsViewModel: iqs.shell.IAccountsViewModel
    ) {
        "ngInject";

        this.transaction = pipTransaction.create('CREDIT_CARD');
        this.creditCards = [];
        this.creditCardsFiltered = [];
    }

    // private operation
    private updateItemInCollection(item: iqs.shell.CreditCard, reReadCollection?: boolean): boolean {
        let changed: boolean = false;

        let index: number = _.findIndex(this.creditCards, (ev) => {
            return ev.id == item.id;
        });

        // insert card without sort
        if (index > -1) {
            if (this.creditCards[index].number !== item.number) {

                this.creditCards[index] = item;
                changed = true;
            }

            if (!reReadCollection) {
                if (this.selectedItem) {
                    if (this.selectedItem.id != item.id) {
                        this.selectItem(0);
                    }
                } else {
                    this.selectItem(index);
                }
            }
        } else {
            changed = true;
            if (this._isSort) {
                index = _.findIndex(this.creditCards, (ev) => {
                    return moment(ev.create_time).valueOf() < moment(item.create_time).valueOf();
                });

                if (index > -1) {
                    this.creditCards.splice(index, 0, item);
                } else {
                    this.creditCards.unshift(item);
                }
            } else {
                this.creditCards.unshift(item);
            }

            if (!reReadCollection) {
                this.applyFilter();
            }
        }

        if (reReadCollection && changed) {
            this.collectionChanged();
        }

        return changed;
    }

    private collectionChanged() {
        this.$timeout(() => {
            this.setState();
        }, 0);
    }

    private setState() {
        this.state = (this.creditCardsFiltered && this.creditCardsFiltered.length > 0) ? iqs.shell.States.Data : iqs.shell.States.Empty;
    }

    private onRead(isReload: boolean, data: iqs.shell.CreditCard[], callback?: (data: iqs.shell.CreditCard[]) => void): void {
        let changed: boolean;
        let index: number = null;
        let creditCards: iqs.shell.CreditCard[] = new Array();
        if (this.creditCards.length == 0 || isReload) {
            if (data && data.length > 0) {
                if (this._isSort) {
                    creditCards = _.sortBy(data, function (item: iqs.shell.CreditCard) {
                        return - moment(item.create_time).valueOf();
                    });
                } else {
                    creditCards = data;
                }

            } else {
                creditCards = [];
                index = -1;
            }
            changed = true;

            this.creditCards = creditCards;
            this.applyFilter();
        } else {
            _.each(data, (item: iqs.shell.CreditCard) => {
                if (this.updateItemInCollection(item, true)) {
                    changed = true;
                }
            });

            this.applyFilter();
        }

        this.selectItem(index);

        this.transaction.end();
        if (changed) {
            this.collectionChanged();
        }
        if (callback) {
            callback(this.creditCards);
        }
    }

    // CRUD operation
    private getFilter(filter?: any): any {
        let _filter: any = _.cloneDeep(this._filter);

        if (!_filter || !angular.isObject(_filter)) {
            _filter = {};
        }

        if (filter) _filter = _.assign(_filter, filter);

        if (!_filter.customer_id && this.pipIdentity.identity) {
            _filter.customer_id = this.pipIdentity.identity.user_id
        }

        if (!_filter.take) {
            _filter.take = this.take
        }

        if (this.search) {
            _filter.search = this.search;
        }

        return _filter;
    }

    public readOptionaly(filter: any, successCallback?: (data: iqs.shell.CreditCard[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        this.transaction.begin('read');

        return this.iqsCreditCardsData.readCreditCard(this.getFilter(filter),
            (response: iqs.shell.DataPage<iqs.shell.CreditCard>) => {
                let result: iqs.shell.CreditCard[] = [];
                if (response && response.data && response.data.length > 0) {
                    result = response.data;
                }
                if (successCallback) {
                    successCallback(result);
                }
                this.transaction.end();
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

    public read(isReload?: boolean, successCallback?: (data: iqs.shell.CreditCard[]) => void, errorCallback?: (error: any) => void): angular.IPromise<any> {
        isReload = isReload === undefined || isReload === null ? false : isReload;

        if (isReload) this.state = iqs.shell.States.Progress;

        this.transaction.begin('read');
        return this.iqsCreditCardsData.readCreditCard(this.getFilter(),
            (response: iqs.shell.DataPage<iqs.shell.CreditCard>) => {
                this.onRead(isReload, response.data, successCallback);
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

    public create(creditCard: iqs.shell.CreditCard, successCallback?: (data: iqs.shell.CreditCard) => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('create_credit_card');
        this.iqsCreditCardsData.createCreditCard(creditCard,
            (data: iqs.shell.CreditCard) => {
                this.updateItemInCollection(data);
                if (successCallback) {
                    successCallback(data);
                }
                this.transaction.end();
            },
            (error: any) => {
                this.transaction.end(error);
                this.$log.error('Create credit card error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    public delete(id: string, customerId?: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.transaction.begin('delete_credit_card');
        let index: number;
        if (this.selectedItem && this.selectedItem.id == id) {
            index = this._selectIndex < this.creditCardsFiltered.length - 1 ? this._selectIndex : this._selectIndex - 1;
        } else {
            index = this._selectIndex;
        }

        this.iqsCreditCardsData.deleteCreditCard(id, customerId,
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
                this.$log.error('Delete credit card error: ', JSON.stringify(error));
                if (errorCallback) {
                    errorCallback(error);
                }
            }
        );
    }

    // property
    public get isSort(): boolean {
        return this._isSort;
    }

    public set isSort(value: boolean) {
        this._isSort = value;
    }

    public get state(): string {
        return this._state;
    }

    public set state(value: string) {
        if (value) {
            this._state = value;
        }
    }

    public get selectAllow(): boolean {
        return this._selectAllow;
    }

    public set selectAllow(value: boolean) {
        if (!!value) {
            this._selectAllow = value;
        }
    }

    public get search(): string {
        return this._search;
    }

    public set search(value: string) {
        this._search = value;
    }

    public set filter(value: any) {
        this._filter = value;
    }

    public get filter(): any {
        return this._filter;
    }

    private getFiltered(localFilter?: AssocietedObject): iqs.shell.CreditCard[] {
        let filtered: boolean = false;
        let filteredCollection: iqs.shell.CreditCard[] = [];
        let searchedCollection: iqs.shell.CreditCard[] = [];

        // not filtered, return all collection
        if (!localFilter) {
            this.localFilters = null;
            this.creditCardsFiltered = this.creditCards;
            this.selectItem();

            return this.creditCardsFiltered;
        }

        if ((localFilter && !_.isEqual(localFilter, this.localFilters))) {
            if (localFilter) {
                filteredCollection = _.filter(this.creditCards, (item: iqs.shell.CreditCard) => {
                    let result: boolean = true;
                    for (let k in localFilter) {
                        if (localFilter.hasOwnProperty(k)) {
                            result = item[k] == localFilter[k];
                        }
                        if (!result) return false;
                    }

                    return result;
                });

                this.localFilters = localFilter;
                filtered = true;
            } else {
                filteredCollection = this.creditCards;
            }

            this.creditCardsFiltered = filteredCollection;
            this.selectItem();
        }
        this.setState();
        return this.creditCardsFiltered;
    }

    public get(): iqs.shell.CreditCard[] {
        return this.creditCardsFiltered
    }

    // data operation
    public applyFilter(localFilter?: AssocietedObject): iqs.shell.CreditCard[] {
        let result = this.getFiltered(localFilter);

        return result;
    }

    public get take(): number {
        return this._take;
    }

    public get selectedIndex(): number {
        return this._selectIndex;
    }

    public getSelectedItem(): iqs.shell.CreditCard {
        return this.selectedItem;
    }

    public getTransaction(): pip.services.Transaction {
        return this.transaction;
    }

    public remove(id: string): void {
        _.remove(this.creditCards, { id: id });
        _.remove(this.creditCardsFiltered, { id: id });

        this.collectionChanged();
    }

    public reload(successCallback?: (data: iqs.shell.CreditCard[]) => void, errorCallback?: (error: any) => void) {
        this.creditCards = new Array();
        this.creditCardsFiltered = new Array();
        this.state = iqs.shell.States.Progress;
        this.read(false, successCallback, errorCallback);
    }

    public selectItem(index?: number): void {
        if (!this._selectAllow || this.creditCardsFiltered.length == 0) {
            this._selectIndex = null;
            this.selectedItem = null;
            this.setState();

            return;
        }

        if (index === undefined || index === null || index < 0 || index > this.creditCardsFiltered.length - 1) {
            if (this.$location.search()['card_id']) {
                index = _.findIndex(this.creditCardsFiltered, (item: iqs.shell.CreditCard) => {
                    return item.id == this.$location.search()['card_id'];
                });
            }
            if (!index || index == -1) {
                index = 0;
            }
        }

        this._selectIndex = index;

        this.selectedItem = (this.creditCardsFiltered && this.creditCardsFiltered.length > 0) ? this.creditCardsFiltered[index] : undefined;
        if (this.selectedItem) {
            this.$location.search('card_id', this.selectedItem.id);
        }
    }

    public clean(): void {
        this.creditCards = [];
        this.creditCardsFiltered = [];
        this._selectIndex = -1;
        this._selectedIndex = -1;
        this.selectedItem = null;
        this.state = iqs.shell.States.Empty;
    }
}