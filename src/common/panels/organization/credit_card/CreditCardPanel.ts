class CreditCardParams {
    card: iqs.shell.CreditCard;
}

interface ICreditCardPanelBindings {
    [key: string]: any;

    onSave: any;
    onInit: any;
    item: any;
    ngDisabled: any;
}

const CreditCardPanelBindings: ICreditCardPanelBindings = {
    onSave: '&iqsSave',
    onInit: '&iqsInit',
    item: '<?iqsItem',
    ngDisabled: '&?'
}

class CreditCardPanelChanges implements ng.IOnChangesObject, ICreditCardPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    onSave: ng.IChangesObject<() => ng.IPromise<void>>;
    onInit: ng.IChangesObject<() => ng.IPromise<void>>;
    item: ng.IChangesObject<iqs.shell.CreditCard>;
    ngDisabled: ng.IChangesObject<() => ng.IPromise<void>>;
}

class CreditCardPanelController implements ng.IController {
    $onInit() { }

    public item: iqs.shell.CreditCard;
    public onSave: (param: CreditCardParams) => void;
    public onInit: (api: any) => void;
    public ngDisabled: () => boolean;

    // public cardNumber: string = null;
    // public cardCode: string = null;
    // public customerFirstName: string = null;
    // public customerLastName: string = null;
    public cardType: string = iqs.shell.CreditCardType.Visa;
    public api: any;
    // public month: number;
    // public year: number;
    public months: any[];
    public years: number[];
    private momentMonths: any[];
    private localeDate: moment.MomentLanguageData = moment.localeData();
    public form: any;
    public touchedErrorsWithHint: Function;
    public cardTypes: any[] = [
        { id: iqs.shell.CreditCardType.Visa, title: 'CREDIT_CARD_VISA' },
        { id: iqs.shell.CreditCardType.Maestro, title: 'CREDIT_CARD_MAESTRO' },
        { id: iqs.shell.CreditCardType.Mastercard, title: 'CREDIT_CARD_MASTERCARD' },
        { id: iqs.shell.CreditCardType.Discover, title: 'CREDIT_CARD_DISCOVER' },
        { id: iqs.shell.CreditCardType.AmericanExpress, title: 'CREDIT_CARD_AMERICAN_EXPRESS' },
    ];

    constructor(
        private $element: JQuery,
        private $document: ng.IDocumentService,
        private $state: ng.ui.IStateService,
        private $scope: ng.IScope,
        private $timeout: ng.ITimeoutService,
        public pipMedia: pip.layouts.IMediaService,
        private pipFormErrors: pip.errors.IFormErrorsService,
        private pipIdentity: pip.services.IIdentityService,
    ) {
        "ngInject";

        $element.addClass('iqs-credit-card-panel');

        this.touchedErrorsWithHint = pipFormErrors.touchedErrorsWithHint;
        this.momentMonths = angular.isArray(this.localeDate['_months']) ? this.localeDate['_months'] : this.localeDate['_months'].format;
        this.months = this.monthList();
        this.years = this.yearList();

        let value = new Date();
        if (!this.item) this.item = new iqs.shell.CreditCard();
        this.item.expire_month = value ? value.getMonth() + 1 : null;
        this.item.expire_year = value ? value.getFullYear() : null;

        const ctrl = this;
        this.$onInit = function () {
            ctrl.api = {};
            ctrl.api.save = ctrl.onSaveClick.bind(ctrl);
            ctrl.onInit({$API: ctrl.api});
        }

    }

    private monthList() {
        let months: any[] = [];

        for (let i: number = 1; i <= 12; i++) {
            months.push({
                id: i,
                name: ("0" + i).substr(-2, 2) // this.momentMonths[i - 1]
            });
        }

        return months;
    }

    private yearList(): number[] {
        let currentYear: number = new Date().getFullYear(),
            startYear: number = currentYear,
            endYear: number = currentYear + 10,
            years = [];


        for (let i: number = startYear; i <= endYear; i++) {
            years.push(i);
        }

        return years;
    }

    private prepare() {
        // this.$timeout(() => {
        //     this.form = this.$scope.form;
        // }, 1000);
    }

    public $postLink(): void {
        this.form = this.$scope.form;
    }

    public $onChanges(changes: CreditCardPanelChanges): void {
        this.prepare();
    }

    onCancel() {
        this.$state.go('organizations.home');
    }

    private getCardType(number: string): string {
        if (!number) return null;

        if (number.substring(0, 1) == '4') return iqs.shell.CreditCardType.Visa;

        let s = number.substring(0, 2);
        if (['50', '51', '52', '53', '54', '55'].indexOf(s) > -1) return iqs.shell.CreditCardType.Mastercard;

        return null;
    }

    public onSaveClick(): void {
        if (this.form.$invalid) {
            this.pipFormErrors.resetFormErrors(this.form, true);

            return;
        }

        if (!this.item.number) return;

        if (this.onSave) {
            let card: iqs.shell.CreditCard = {
                type: this.getCardType(this.item.number),
                number: this.item.number.replace(/\D+/g, ""), //this.cardNumber,
                expire_month: Number(this.item.expire_month),
                expire_year: Number(this.item.expire_year),
                ccv: this.item.ccv,
                name: this.item.first_name.trim() + ' ' + this.item.last_name.trim(),
                first_name: this.item.first_name.trim(),
                last_name: this.item.last_name.trim()               // saved: true,
                // default: true,
                // state: "ok"

            };
            this.onSave({ card: card });
            this.pipFormErrors.resetFormErrors(this.form, false);
        }
    }

}

(() => {
    angular
        .module('iqsCreditCardPanel', [])
        .component('iqsCreditCardPanel', {
            bindings: CreditCardPanelBindings,
            templateUrl: 'common/panels/organization/credit_card/CreditCardPanel.html',
            controller: CreditCardPanelController,
            controllerAs: '$ctrl'
        })
})();
