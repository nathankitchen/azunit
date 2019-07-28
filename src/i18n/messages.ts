import { IAzuLocale } from "./locale";

export enum MessageType {
    Default = 0,
    Heading = 1,
    Minor = 2,
    Success = 3,
    Warning = 4,
    Failure = 5,
    Error = 6
}

export type IconFormatterFunc = (token: string, type: MessageType) => string;
export type TokenFormatterFunc = (token: string) => string;

export interface IAzuCultureMessage {
    readonly icon: string;
    readonly type: MessageType;
    toString(locale: IAzuLocale, iconFormatter?: IconFormatterFunc, tokenFormatter?: TokenFormatterFunc): string;
}

abstract class AzuCultureMessage {
    public abstract readonly icon: string;
    public abstract readonly type: MessageType;

    public toString(locale: IAzuLocale, iconFormatter?: IconFormatterFunc, tokenFormatter?: TokenFormatterFunc) {
        iconFormatter = iconFormatter || ((s, t) => s);
        tokenFormatter = tokenFormatter || ((s) => s);

        let message = "";

        if (this.icon) {
            const iconFormat = iconFormatter(this.icon, this.type);
            
            if (iconFormat) {
                message += iconFormat + " ";
            }
        }

        let m = this.getLocaleString(locale);

        message += this.formatMessage(m, tokenFormatter);

        return message;
    }

    protected abstract getLocaleString(locale: IAzuLocale): string;
    protected abstract formatMessage(message: string, tokenFormatter: TokenFormatterFunc): string;
}

abstract class AssertionMessage extends AzuCultureMessage {

    constructor(name: string, resource: string, expected: any, actual: any) {
        super();
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

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc) {
        return message
        .replace("{name}", tokenFormatter(this.name))
        .replace("{actual}", tokenFormatter(this.actual))
        .replace("{expected}", tokenFormatter(this.expected))
        .replace("{resource}", tokenFormatter(this.resource));
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