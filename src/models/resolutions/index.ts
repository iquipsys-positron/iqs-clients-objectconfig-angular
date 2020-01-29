import './ResolutionsModel';
import './ResolutionsViewModel';

let m: any;

try {
    m = angular.module('iqsResolutions');
    m.requires.push(...[
        'iqsResolutions.ViewModel'
    ]);
} catch (err) { }

export * from './IResolutionsViewModel';
