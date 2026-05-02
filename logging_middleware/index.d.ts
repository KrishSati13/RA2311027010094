export type StackType = "backend" | "frontend";
export type LevelType = "debug" | "info" | "warn" | "error" | "fatal";
export type PackageType = 
    | "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service" 
    | "api" | "component" | "hook" | "page" | "state" | "style" 
    | "auth" | "config" | "middleware" | "utils";

export declare function Log(
    stack: StackType,
    level: LevelType,
    pkg: PackageType,
    message: string
): Promise<any>;
