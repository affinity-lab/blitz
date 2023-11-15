/// <reference types="node" />
import { MySqlTable, MySqlUpdateSetSource, PreparedQuery } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { Cache, type KeyValue } from "@affinity-lab/affinity-util";
import { EventEmitter } from "events";
import { CollectionStorage } from "../storage/collection-storage";
export declare class MySqlRepository<S extends Record<string, any> = any, T extends MySqlTable = any> {
    readonly schema: T;
    readonly db: MySql2Database<S>;
    readonly eventEmitter: EventEmitter;
    readonly collectionStorage?: CollectionStorage | undefined;
    protected store?: Cache<{ [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; }[K]; } : never> | undefined;
    protected cache?: Cache<{ [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; }[K]; } : never> | undefined;
    static cache(ttl?: number): MethodDecorator;
    static store(): MethodDecorator;
    protected publicFields: Record<string, any>;
    protected excludedFields: Array<string>;
    constructor(schema: T, db: MySql2Database<S>, eventEmitter: EventEmitter, collectionStorage?: CollectionStorage | undefined, store?: Cache<{ [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; }[K]; } : never> | undefined, cache?: Cache<{ [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof T["_"]["columns"] & string as Key]: T["_"]["columns"][Key]["_"]["notNull"] extends true ? T["_"]["columns"][Key]["_"]["data"] : T["_"]["columns"][Key]["_"]["data"] | null; }[K]; } : never> | undefined);
    get name(): string;
    get baseQueries(): Record<string, PreparedQuery<any>>;
    protected itemToKeyValue(items: Array<InferSelectModel<T>>): Array<KeyValue<InferSelectModel<T>>>;
    protected itemToKeyValue(item: InferSelectModel<T>): KeyValue<InferSelectModel<T>>;
    get(ids: Array<number>): Promise<Array<InferSelectModel<T>>>;
    get(id: number): Promise<InferSelectModel<T> | undefined>;
    get(id: null): Promise<undefined>;
    get(id: undefined): Promise<undefined>;
    private getFromStoreOrDatabase;
    protected all(ids: Array<number>): Promise<Array<InferSelectModel<T>>>;
    private allFromStoreOrDatabase;
    insert(values: InferInsertModel<T>): Promise<number | undefined>;
    update(id: number, values: MySqlUpdateSetSource<T>): Promise<any>;
    delete(id: number): Promise<void>;
}
