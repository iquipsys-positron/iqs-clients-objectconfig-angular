import { AssocietedObject } from './CreditCardsModel';

export interface ICreditCardsViewModel {
    state: string;
    isSort: boolean;
    selectAllow: boolean;
    filter: any;
    selectedIndex: number;
    search: string;

    read(isLoading?: boolean, successCallback?: (data: iqs.shell.CreditCard[]) => void, errorCallback?: (error: any) => void);
    reload(successCallback?: (data: iqs.shell.CreditCard[]) => void, errorCallback?: (error: any) => void): void;
    getCollection(): iqs.shell.CreditCard[];
    applyFilter(localFilter?: AssocietedObject): iqs.shell.CreditCard[];
    getTransaction(): pip.services.Transaction;
    selectItem(index?: number): void;
    getSelectedItem(): iqs.shell.CreditCard;
    removeItem(id: string): void;
    create(creditCard: iqs.shell.CreditCard, successCallback?: (data: iqs.shell.CreditCard) => void, errorCallback?: (error: any) => void): void;
    deleteCreditCardById(id: string, customerId?: string, successCallback?: () => void, errorCallback?: (error: any) => void): void;
    clean(): void;
}