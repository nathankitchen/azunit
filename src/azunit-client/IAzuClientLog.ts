export interface IAzuClientLog {
    trace(message: string) : void;
    write(message: string) : void;
    warning(message: string) : void;
    error(message: string) : void;
}