import { IAzuLocale } from './locale';
import { AzuLocaleEnGb } from './locales.en-gb';
import * as Messages from './messages';

export { IAzuLocale };
export { IAzuCultureMessage } from "./messages";

export class Culture {
    static enGb() { return new AzuLocaleEnGb(); }
}

export class Resources {

    static title() {
        return new Messages.Title();
    }

    static fatalError(err: Error) {
        return new Messages.FatalError(err);
    }

    static statusTenant(tenant: string) {
        return new Messages.TenantStatus(tenant);
    }

    static statusSubscription(subscription: string) {
        return new Messages.SubscriptionStatus(subscription);
    }

    static statusTest(test: string) {
        return new Messages.TestStatus(test);
    }

    static getAssertionResourceExistsFailMessage(name: string, resource: string, expected: any, actual: any) {
        return new Messages.TestAssertionEqualsSuccess(name, resource, expected, actual);
    }

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

    static getAssertionDisabledSuccessMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionDisabledSuccess(name, resource, false, actual);
    }

    static getAssertionDisabledFailureMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionDisabledFailure(name, resource, true, actual);
    }
}