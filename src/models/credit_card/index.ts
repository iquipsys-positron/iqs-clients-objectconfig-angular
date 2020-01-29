import './CreditCardsModel';
import './CreditCardViewModel';

let m: any;

try {
    m = angular.module('iqsCreditCards');
    m.requires.push(...[
        'iqsCreditCards.ViewModel'
    ]);
} catch (err) { }

export * from './ICreditCardsViewModel';
