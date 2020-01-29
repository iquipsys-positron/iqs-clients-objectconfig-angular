export interface IEmergencyPlansViewModel {
    state: string;
    isSort: boolean;
    filter: any;
    selectedIndex: number;
    searchedCollection: string[];
    mustOpened: iqs.shell.EmergencyPlan;
    selectedItem: iqs.shell.EmergencyPlan;

    read(successCallback?: (data: iqs.shell.EmergencyPlan[]) => void, errorCallback?: (error: any) => void);
    reload(successCallback?: (data: iqs.shell.EmergencyPlan[]) => void, errorCallback?: (error: any) => void): void;
    getCollection(localSearch?: string): iqs.shell.EmergencyPlan[];
    getTransaction(): pip.services.Transaction;
    selectItem(index?: number): void;
    getSelectedItem(): iqs.shell.EmergencyPlan;

    removeItem(id: string): void;
    create(gateway: iqs.shell.EmergencyPlan, successCallback?: (data: iqs.shell.EmergencyPlan) => void, errorCallback?: (error: any) => void): void;
    deleteEmergencyPlansById(id: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    updateEmergencyPlansById(id: string, gateway: iqs.shell.EmergencyPlan, successCallback?: (data: iqs.shell.EmergencyPlan) => void, errorCallback?: (error: any) => void): void;
    selectItemById(id: string): void;
    clean(): void;
}
