import { IAzuLocale } from "./locale";

export enum MessageType {
    Default = 0,
    Title = 1,
    Heading = 2,
    Minor = 3,
    Success = 4,
    Warning = 5,
    Failure = 6,
    Error = 7
}

export type IconFormatterFunc = (token: string, type: MessageType) => string;
export type TokenFormatterFunc = (token: string) => string;

export interface IAzuCultureMessage {
    readonly icon: string;
    readonly type: MessageType;
    readonly indent: number;
    toString(locale: IAzuLocale, iconFormatter?: IconFormatterFunc, tokenFormatter?: TokenFormatterFunc): string;
}

abstract class AzuCultureMessage {
    constructor(indent: number) {
        this.indent = indent;
    }
    
    public abstract readonly icon: string;
    public abstract readonly type: MessageType;
    public readonly indent: number;

    public toString(locale: IAzuLocale, iconFormatter?: IconFormatterFunc, tokenFormatter?: TokenFormatterFunc) {
        iconFormatter = iconFormatter || ((s, t) => s);
        tokenFormatter = tokenFormatter || ((s) => s);

        let message = "";

        for (let i=0; i<this.indent; i++) {
            message += "   ";
        }

        if (this.icon) {
            const iconFormat = iconFormatter(this.icon, this.type);
            
            if (iconFormat) {
                message += iconFormat + " ";
            }
        }

        let m = this.getLocaleString(locale);

        message += this.formatMessage(m, tokenFormatter, locale);

        return message;
    }

    protected abstract getLocaleString(locale: IAzuLocale): string;
    protected abstract formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: IAzuLocale): string;
}

abstract class TextCultureMessage extends AzuCultureMessage {
    public abstract readonly icon: string;
    public abstract readonly type: MessageType;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: IAzuLocale) { return message; }
    protected abstract getLocaleString(locale: IAzuLocale): string;
}

export class TenantStatus extends AzuCultureMessage {
    constructor(tenant: string) {
        super(0);
        this.icon = "";
        this.type = MessageType.Default;
        this.tenant = tenant;
    }

    public readonly icon: string;
    public readonly type: MessageType;
    public readonly tenant: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: IAzuLocale) {
        return message
        .replace("{tenant}", tokenFormatter(this.tenant));
    }
    protected getLocaleString(locale: IAzuLocale) { return locale.status_tenant; }
}

export class SubscriptionStatus extends AzuCultureMessage {
    constructor(subscription: string) {
        super(0);
        this.icon = "";
        this.type = MessageType.Default;
        this.subscription = subscription;
    }

    public readonly icon: string;
    public readonly type: MessageType;
    public readonly subscription: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: IAzuLocale) {
        return message
        .replace("{subscription}", tokenFormatter(this.subscription));
    }
    protected getLocaleString(locale: IAzuLocale) { return locale.status_subscription; }
}

export class TestStatus extends AzuCultureMessage {
    constructor(testName: string) {
        super(1);
        this.icon = "\u25b6";
        this.type = MessageType.Heading;
        this.indent = 1;
        this.testName = testName;
    }

    public readonly icon: string;
    public readonly type: MessageType;
    public readonly indent: number;
    public readonly testName: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: IAzuLocale) {
        return message
        .replace("{test}", tokenFormatter(this.testName));
    }
    protected getLocaleString(locale: IAzuLocale) { return locale.status_test; }
}

abstract class AssertionMessage extends AzuCultureMessage {

    constructor(name: string, resource: string, expected: any, actual: any) {
        super(2);
        this.name = name;
        this.resource = resource;
        this.expected = expected;
        this.actual = actual;
    }

    public readonly name: string;
    public readonly resource: string;
    public readonly expected: any;
    public readonly actual: any;
    public abstract readonly icon: string;
    public abstract readonly type: MessageType;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: IAzuLocale) {

        let resourceText = (this.resource == "") ? locale.selected_resources: this.resource;
        let actualText = (this.actual == undefined) ? locale.no_resources: this.actual;

        return message
        .replace("{name}", tokenFormatter(this.name))
        .replace("{actual}", tokenFormatter(actualText))
        .replace("{expected}", tokenFormatter(this.expected))
        .replace("{resource}", tokenFormatter(resourceText));
     }

     protected abstract getLocaleString(locale: IAzuLocale): string;
}

abstract class AssertionSuccessMessage extends AssertionMessage {
    public readonly icon: string = "\u2714";
    public readonly type: MessageType = MessageType.Success;
    public abstract getLocaleString(locale: IAzuLocale): string;
}

abstract class AssertionFailureMessage extends AssertionMessage {
    public readonly icon: string = "\u2718";
    public readonly type: MessageType = MessageType.Failure;
    public abstract getLocaleString(locale: IAzuLocale): string;
}

export class Title extends TextCultureMessage {
    constructor() {
        super(0);
    }

    public readonly icon: string = "";
    public readonly type: MessageType = MessageType.Title;
    public getLocaleString(locale: IAzuLocale) { return locale.title; }
}

export class FatalError extends AzuCultureMessage {
    constructor(err: Error) {
        super(0);
        this.error = err;
    }

    public readonly icon: string = "\u2620";
    public readonly type: MessageType = MessageType.Error;

    protected error: Error; 
    
    public getLocaleString(locale: IAzuLocale) { return locale.fatal_error; }

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc) {
        return message
        .replace("{error}", tokenFormatter(this.error.name))
        .replace("{message}", tokenFormatter(this.error.message));
     }
}

export class TestAssertionEqualsSuccess extends AssertionSuccessMessage {
    public getLocaleString(locale: IAzuLocale) { return locale.test_assertion_equals_pass; }
}

export class TestAssertionEqualsFailure extends AssertionFailureMessage {
    public getLocaleString(locale: IAzuLocale) { return locale.test_assertion_equals_fail; }
}

export class TestAssertionEnabledSuccess extends AssertionSuccessMessage {
    public getLocaleString(locale: IAzuLocale) { return locale.test_assertion_enabled_pass; }
}

export class TestAssertionEnabledFailure extends AssertionFailureMessage {
    public getLocaleString(locale: IAzuLocale) { return locale.test_assertion_enabled_fail; }
}

export class TestAssertionDisabledSuccess extends AssertionSuccessMessage {
    public getLocaleString(locale: IAzuLocale) { return locale.test_assertion_disabled_pass; }
}

export class TestAssertionDisabledFailure extends AssertionFailureMessage {
    public getLocaleString(locale: IAzuLocale) { return locale.test_assertion_disabled_fail; }
}