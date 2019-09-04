import { IAzuLocale } from './locale';
import { AzuLocaleEnGb } from './locales.en-gb';
import * as Messages from './messages';
import { AzuState } from '../io/results';

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

    static startRun(run: string, subscription: string) {
        return new Messages.StartRun(run, subscription);
    }

    static startGroup(name: string, source: string) {
        return new Messages.StartGroup(name, source);
    }

    static startTest(test: string) {
        return new Messages.StartTest(test);
    }

    static getAssertionResourceExistsFailMessage(name: string, resource: string, expected: any, actual: any) {
        return new Messages.TestAssertionEqualsSuccess(name, resource, expected, actual, AzuState.Ignored);
    }

    static getAssertionEqualsSuccessMessage(name: string, resource: string, expected: any, actual: any) {
        return new Messages.TestAssertionEqualsSuccess(name, resource, expected, actual, AzuState.Passed);
    }

    static getAssertionEqualsFailureMessage(name: string, resource: string, expected: any, actual: any) {
        return new Messages.TestAssertionEqualsFailure(name, resource, expected, actual, AzuState.Failed);
    }

    static getAssertionEnabledSuccessMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionEnabledSuccess(name, resource, true, actual, AzuState.Passed);
    }

    static getAssertionEnabledFailureMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionEnabledFailure(name, resource, false, actual, AzuState.Failed);
    }

    static getAssertionDisabledSuccessMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionDisabledSuccess(name, resource, false, actual, AzuState.Passed);
    }

    static getAssertionDisabledFailureMessage(name: string, resource: string, actual: boolean) {
        return new Messages.TestAssertionDisabledFailure(name, resource, true, actual, AzuState.Failed);
    }
}