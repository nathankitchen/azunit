import { MessageType } from "./MessageType";
import { AzuState } from "../azunit";
import * as Globalization from "../azunit-globalization";
    
export type IconFormatterFunc = (token: string, type: MessageType) => string;
export type TokenFormatterFunc = (token: string, start?: string, end?: string) => string;

export interface IAzuCultureMessage {
    readonly icon: string;
    readonly type: MessageType;
    toString(locale: Globalization.IAzuLocale, iconFormatter?: IconFormatterFunc, tokenFormatter?: TokenFormatterFunc, indent?: number, tokenStart?: string, tokenEnd?: string): string;
}

abstract class AzuCultureMessage {
    constructor(type: MessageType = MessageType.Default, icon: string = "") {
        this.type = type;
        this.icon = icon;
    }
    
    public readonly icon: string;
    public readonly type: MessageType;

    public toString(locale: Globalization.IAzuLocale, iconFormatter?: IconFormatterFunc, tokenFormatter?: TokenFormatterFunc, indent: number = 0, tokenStart?: string, tokenEnd?: string) {
        iconFormatter = iconFormatter || ((s, t) => s);
        tokenFormatter = tokenFormatter || ((s) => s);

        let message = "";

        for (let i=0; i<indent; i++) {
            message += "   ";
        }

        if (this.icon) {
            const iconFormat = iconFormatter(this.icon, this.type);
            
            if (iconFormat) {
                message += iconFormat + " ";
            }
        }

        let m = this.getLocaleString(locale);

        message += this.formatMessage(m, tokenFormatter, locale, tokenStart, tokenEnd);

        return message;
    }

    protected abstract getLocaleString(locale: Globalization.IAzuLocale): string;
    protected abstract formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale, tokenStart?: string, tokenEnd?: string): string;
}

abstract class TextCultureMessage extends AzuCultureMessage {
    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale, tokenStart?: string, tokenEnd?: string) { return message; }
    protected abstract getLocaleString(locale: Globalization.IAzuLocale): string;
}

export class AzuClientMessage extends TextCultureMessage {
    constructor(message: string, type: MessageType) {
        super(type, " ");
        this._message = message;
    }

    private readonly _message: string;
    
    protected getLocaleString(locale: Globalization.IAzuLocale): string {
        return this._message;
    }
}

export class TenantStatus extends AzuCultureMessage {
    constructor(tenant: string) {
        super();
        this.tenant = tenant;
    }

    public readonly tenant: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale) {
        return message
        .replace("{tenant}", tokenFormatter(this.tenant));
    }
    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.status_tenant; }
}

export class SubscriptionStatus extends AzuCultureMessage {
    constructor(subscription: string) {
        super();
        this.subscription = subscription;
    }

    public readonly subscription: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale) {
        return message
        .replace("{subscription}", tokenFormatter(this.subscription));
    }
    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.status_subscription; }
}

export class StartRun extends AzuCultureMessage {
    constructor(name: string, subscription: string) {
        super(MessageType.Heading, "\u25b6");
        this.name = name;
        this.subscription = subscription;
    }

    public readonly name: string;
    public readonly subscription: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale) {
        return message
        .replace("{run}", tokenFormatter(this.name))
        .replace("{subscription}", tokenFormatter(this.subscription));
    }

    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.start_run; }
}

export class StartGroup extends AzuCultureMessage {
    constructor(groupName: string, source: string) {
        super(MessageType.Heading, "\u25b6");
        this.groupName = groupName;
        this.source = source;
    }

    public readonly groupName: string;
    public readonly source: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale) {
        return message
        .replace("{group}", tokenFormatter(this.groupName))
        .replace("{source}", tokenFormatter(this.source));
    }

    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.start_group; }
}

export class StartTest extends AzuCultureMessage {
    constructor(name: string) {
        super(MessageType.Heading, "\u25b6");
        this.name = name;
    }

    public readonly name: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale) {
        return message
        .replace("{test}", tokenFormatter(this.name));
    }
    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.start_test; }
}

export abstract class AssertionMessage extends AzuCultureMessage {

    constructor(name: string, resource: string, expected: any, actual: any, state: AzuState) {
        super();
        this.name = name;
        this.resource = resource;
        this.expected = expected;
        this.actual = actual;
        this.state = state;

        switch (this.state) {
            case AzuState.Failed:
                this.icon = "\u2718";
                this.type = MessageType.Failure;
                break;
            case AzuState.Passed:
                this.icon = "\u2714";
                this.type = MessageType.Success;
                break;
            default:
                this.icon = "\u9208";
                this.type = MessageType.Ignore;
                break;
        }
    }

    public readonly state: AzuState;
    public readonly name: string;
    public readonly resource: string;
    public readonly expected: any;
    public readonly actual: any;
    public readonly icon: string;
    public readonly type: MessageType;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale) {

        let resourceText = (this.resource == "") ? locale.selected_resources: this.resource;
        let actualText = (this.actual == undefined) ? locale.no_resources: this.actual;

        return message
            .replace("{name}", tokenFormatter(this.name))
            .replace("{actual}", tokenFormatter(actualText))
            .replace("{expected}", tokenFormatter(this.expected))
            .replace("{resource}", tokenFormatter(resourceText));
    }

    protected abstract getLocaleString(locale: Globalization.IAzuLocale): string;
}

export class EndRunPassed extends AzuCultureMessage {
    constructor(tests: number, seconds: number) {
        super(MessageType.Success, "");
        this.tests = tests;
        this.seconds = seconds;
    }

    public readonly tests: number;
    public readonly seconds: number;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale, tokenStart?: string, tokenEnd?: string) {
        return message
        .replace("{tests}", tokenFormatter(this.tests.toString(), tokenStart, tokenEnd))
        .replace("{seconds}", tokenFormatter(this.seconds.toString(), tokenStart, tokenEnd));
    }

    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.end_run_passed; }
}

export class EndRunFailed extends AzuCultureMessage {
    constructor(tests: number, failures: number, seconds: number) {
        super(MessageType.Failure, "");
        this.tests = tests;
        this.failures = failures;
        this.seconds = seconds;
    }

    public readonly tests: number;
    public readonly failures: number;
    public readonly seconds: number;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale, tokenStart?: string, tokenEnd?: string) {
        return message
        .replace("{total}", tokenFormatter(this.tests.toString(), tokenStart, tokenEnd))
        .replace("{failures}", tokenFormatter(this.failures.toString(), tokenStart, tokenEnd))
        .replace("{seconds}", tokenFormatter(this.seconds.toString(), tokenStart, tokenEnd));
    }
    
    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.end_run_failed; }
}

export class Title extends TextCultureMessage {
    constructor(version: string) {
        super(MessageType.Title, "");
        this.version = version;
    }

    public readonly version: string;

    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.title + " v" + this.version; }
}

export class FatalError extends AzuCultureMessage {
    constructor(err: Error) {
        super(0);
        this.error = err;
    }

    public readonly icon: string = "\u2620";
    public readonly type: MessageType = MessageType.Error;

    protected error: Error; 
    
    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.fatal_error; }

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc) {
        return message
        .replace("{error}", tokenFormatter(this.error.name))
        .replace("{message}", tokenFormatter(this.error.message));
    }
}

export class Completed extends TextCultureMessage {
    constructor() {
        super(MessageType.Default, "");
    }

    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.msg_completed; }
}

export class TestAssertionEqualsSuccess extends AssertionMessage {
    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.test_assertion_equals_pass; }
}

export class TestAssertionEqualsFailure extends AssertionMessage {
    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.test_assertion_equals_fail; }
}

export class TestAssertionEnabledSuccess extends AssertionMessage {
    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.test_assertion_enabled_pass; }
}

export class TestAssertionEnabledFailure extends AssertionMessage {
    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.test_assertion_enabled_fail; }
}

export class TestAssertionDisabledSuccess extends AssertionMessage {
    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.test_assertion_disabled_pass; }
}

export class TestAssertionDisabledFailure extends AssertionMessage {
    public getLocaleString(locale: Globalization.IAzuLocale) { return locale.test_assertion_disabled_fail; }
}

export class DumpResourceMessage extends AzuCultureMessage {
    constructor(count: number, file: string) {
        super();
        this.count = count;
        this.file = file;
    }

    public readonly count: number;
    public readonly file: string;

    protected formatMessage(message: string, tokenFormatter: TokenFormatterFunc, locale: Globalization.IAzuLocale) {
        return message
        .replace("{file}", tokenFormatter(this.file))
        .replace("{count}", tokenFormatter(this.count.toString()));
    }
    protected getLocaleString(locale: Globalization.IAzuLocale) { return locale.dump_resource_complete; }
}