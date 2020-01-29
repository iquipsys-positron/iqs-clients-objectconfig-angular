export interface IResolutionsViewModel {
    state: string;
    isSort: boolean;
    filter: any;
    selectedIndex: number;
    searchedCollection: string[];

    read(successCallback?: (data: iqs.shell.Resolution[]) => void, errorCallback?: (error: any) => void);
    reload(successCallback?: (data: iqs.shell.Resolution[]) => void, errorCallback?: (error: any) => void): void;
    getCollection(localSearch?: string): iqs.shell.Resolution[];
    getTransaction(): pip.services.Transaction;
    selectItem(index?: number): void;
    getSelectedItem(): iqs.shell.Resolution;

    removeItem(id: string): void;
    create(eventTemplate: iqs.shell.Resolution, successCallback?: (data: iqs.shell.Resolution) => void, errorCallback?: (error: any) => void): void;
    deleteResolutionById(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    updateResolutionById(id: string, eventTemplate: iqs.shell.Resolution, successCallback?: (data: iqs.shell.Resolution) => void, errorCallback?: (error: any) => void): void;
    getResolutionsByEventRuleId(ruleId: string): iqs.shell.Resolution[];
    getResolutionsByName(resolution: string): iqs.shell.Resolution;
    clean(): void;
}
