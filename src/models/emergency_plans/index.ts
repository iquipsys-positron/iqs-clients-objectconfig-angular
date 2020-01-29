import './EmergencyPlansModel';
import './EmergencyPlansViewModel';

let m: any;

try {
    m = angular.module('iqsEmergencyPlans');
    m.requires.push(...[
        'iqsEmergencyPlans.ViewModel'
    ]);
} catch (err) { }

export * from './IEmergencyPlansViewModel';
