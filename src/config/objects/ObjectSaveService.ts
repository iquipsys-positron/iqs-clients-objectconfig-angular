import { IObjectsSaveService } from './IObjectsSaveService';

class ObjectsSaveService implements IObjectsSaveService {
    private _objectId: string;
    private _currState: string;
    private _search: string;

    constructor(

    ) {
        "ngInject";
    }

    public set objectId(objectId: string) {
        this._objectId = objectId;
    }

    public get objectId(): string {
        return this._objectId;
    }

    public set currState(currState: string) {
        this._currState = currState;
    }

    public get currState(): string {
        return this._currState;
    }

    public set search(search: string) {
        this._search = search;
    }

    public get search(): string {
        return this._search;
    }

}

{
    angular.module('iqsObjects.SaveService', [])
        .service('iqsObjectsSaveService', ObjectsSaveService);
}