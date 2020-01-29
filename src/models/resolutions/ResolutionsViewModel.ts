import { IResolutionsViewModel } from './IResolutionsViewModel';
import { ResolutionsModel } from './ResolutionsModel';

class ResolutionsViewModel implements IResolutionsViewModel {
    private _filter: any;
    private resolutionsModel: ResolutionsModel;

    constructor(
        private $log: ng.ILogService,
        private $location: ng.ILocationService,
        private $timeout: ng.ITimeoutService,
        private pipTransaction: pip.services.ITransactionService,
        private iqsOrganization: iqs.shell.IOrganizationService,
        private iqsResolutionsData: iqs.shell.IResolutionsDataService
    ) {
        "ngInject";

        this._filter = null;
        this.resolutionsModel = new ResolutionsModel($log, $location, $timeout, pipTransaction, iqsOrganization, iqsResolutionsData);
    }

    public read(successCallback?: (data: iqs.shell.Resolution[]) => void, errorCallback?: (error: any) => void) {
        this.resolutionsModel.filter = this._filter;
        this.resolutionsModel.read(successCallback, errorCallback);
    }

    public reload(successCallback?: (data: iqs.shell.Resolution[]) => void, errorCallback?: (error: any) => void): void {
        this.resolutionsModel.filter = this._filter;
        this.resolutionsModel.reload(successCallback, errorCallback);
    }

    public getCollection(localSearch?: string): iqs.shell.Resolution[] {
        return this.resolutionsModel.get(localSearch);
    }

    public getTransaction(): pip.services.Transaction {
        return this.resolutionsModel.getTransaction();
    }

    public get isSort(): boolean {
        return this.resolutionsModel.isSort;
    }

    public set isSort(value: boolean) {
        if (!!value) {
            this.resolutionsModel.isSort = value;
        }
    }

    public set filter(value: any) {
        this._filter = value;
    }

    public get filter(): any {
        return this._filter;
    }

    public get state(): string {
        return this.resolutionsModel.state;
    }

    public set state(value: string) {
        this.resolutionsModel.state = value;
    }

    public selectItem(index?: number) {
        this.resolutionsModel.selectItem(index);
    }

    public getSelectedItem(): iqs.shell.Resolution {
        return this.resolutionsModel.getSelectedItem();
    }

    public get searchedCollection(): string[] {
        return this.resolutionsModel.getSearchedCollection();
    }

    public get selectedIndex(): number {
        return this.resolutionsModel.getSelectedIndex();
    }

    public set selectedIndex(index: number) {
        this.resolutionsModel.selectItem(index);
    }

    public removeItem(id: string) {
        this.resolutionsModel.remove(id);
    }

    public create(resolution: iqs.shell.Resolution, successCallback?: (data: iqs.shell.Resolution) => void, errorCallback?: (error: any) => void): void {
        this.resolutionsModel.create(resolution, successCallback, errorCallback);
    }

    public deleteResolutionById(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void {
        this.resolutionsModel.delete(id, successCallback, errorCallback);
    }

    public updateResolutionById(id: string, resolution: iqs.shell.Resolution, successCallback?: (data: iqs.shell.Resolution) => void, errorCallback?: (error: any) => void): void {
        this.resolutionsModel.update(id, resolution, successCallback, errorCallback);
    }

    public getResolutionsByEventRuleId(ruleId: string): iqs.shell.Resolution[] {
        return this.resolutionsModel.getResolutionsByEventRuleId(ruleId);
    }

    public getResolutionsByName(resolution: string): iqs.shell.Resolution {
        return this.resolutionsModel.getResolutionsByName(resolution);
    } 

    public clean(): void {
        this.resolutionsModel.clean();
    }       
}


angular.module('iqsResolutions.ViewModel', ['iqsData'])
    .service('iqsResolutionsViewModel', ResolutionsViewModel);

