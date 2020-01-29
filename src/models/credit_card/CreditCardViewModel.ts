import { ICreditCardsViewModel } from './ICreditCardsViewModel';
import { CreditCardsModel, AssocietedObject } from './CreditCardsModel';

class CreditCardViewModel implements ICreditCardsViewModel {
    private model: CreditCardsModel;
    private _filter: any;

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
        this._filter = null;

        this.model = new CreditCardsModel($log, $location, $timeout, pipTransaction,
            pipIdentity, iqsCreditCardsData, iqsAccountsViewModel);
    }

    public read(isLoading?: boolean, successCallback?: (data: iqs.shell.CreditCard[]) => void, errorCallback?: (error: any) => void) {
        this.model.filter = this._filter;
        this.model.read(isLoading, successCallback, errorCallback);
    }

    public reload(successCallback?: (data: iqs.shell.CreditCard[]) => void, errorCallback?: (error: any) => void): void {
        this.model.filter = this._filter;

        this.model.reload(successCallback, errorCallback);
    }

    public getCollection(): iqs.shell.CreditCard[] {
        return this.model.get();
    }

    public applyFilter(localFilter?: AssocietedObject): iqs.shell.CreditCard[] {
        return this.model.applyFilter(localFilter);
    }

    public getTransaction(): pip.services.Transaction {
        return this.model.getTransaction();
    }

    public get state(): string {
        return this.model.state;
    }

    public set state(value: string) {
        this.model.state = value;
    }

    public get search(): string {
        return this.model.search;
    }

    public set search(value: string) {
        this.model.search = value;
    }

    public set filter(value: any) {
        this._filter = _.assign(this._filter, value);
    }

    public get filter(): any {
        return this._filter;
    }

    public selectItem(index?: number) {
        this.model.selectItem(index);
    }

    public get isSort(): boolean {
        return this.model.isSort;
    }

    public set isSort(value: boolean) {
        if (!!value) {
            this.model.isSort = value;
        }
    }

    public get selectAllow(): boolean {
        return this.model.selectAllow;
    }

    public set selectAllow(value: boolean) {
        if (!!value) {
            this.model.selectAllow = value;
        }
    }

    public getSelectedItem(): iqs.shell.CreditCard {
        return this.model.getSelectedItem();
    }

    public get selectedIndex(): number {
        return this.model.selectedIndex;
    }

    public set selectedIndex(index: number) {
        this.model.selectItem(index);
    }

    public removeItem(id: string) {
        this.model.remove(id);
    }

    public create(creditCard: iqs.shell.CreditCard, successCallback?: (data: iqs.shell.CreditCard) => void, errorCallback?: (error: any) => void): void {
        this.model.create(creditCard, successCallback, errorCallback);
    }

    public deleteCreditCardById(id: string, customerId?: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.model.delete(id, customerId, successCallback, errorCallback);
    }

    public clean(): void {
        this.model.clean();
    }

}
{
    angular
        .module('iqsCreditCards.ViewModel', [
            'iqsCreditCards.Data',
            'iqsAccounts.ViewModel'
        ])
        .service('iqsCreditCardsViewModel', CreditCardViewModel);

}