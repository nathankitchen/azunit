import { IAzuLocale } from './locale';
import { AzuLocaleEnGb } from './locales.en-gb';
import * as Messages from './messages';

export { IAzuLocale };
export { IAzuCultureMessage } from "./messages";

export class Culture {
    static enGb() { return new AzuLocaleEnGb(); }
}

export class Resources {
    static getAssertionEqualsSuccessMessage(name: string, resource: string, expected: any, actual: any) {
        return new Messages.TestAssertionEqualsSuccess(name, resource, expected, actual);
    }

    static getAssertionEqualsFailureMessage(name: string, resource: string, expected: any, actual: any) {
        return new Messages.TestAssertionEqualsFailure(name, resource, expected, actual);
    }

    static getAssertionEnabledSuccessMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionEnabledSuccess(name, resource, true, actual);
    }

    static getAssertionEnabledFailureMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionEnabledFailure(name, resource, false, actual);
    }
}