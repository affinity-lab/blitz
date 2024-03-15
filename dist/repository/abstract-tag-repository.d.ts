import { MySqlTable } from "drizzle-orm/mysql-core";
import { ITagManager } from "../tag-manager-interface";
import { ITagRepository } from "./tag-repository-interface";
export declare abstract class AbstractTagRepository<S extends Record<string, any> = any, T extends MySqlTable = any, TM extends ITagManager = any> extends ITagRepository<S, T, TM> {
    private queries;
    initialize(c: new (...args: any) => TM): void;
    createTag(tag: string): Promise<void>;
    renameTag(oldName: string, newName: string): Promise<void>;
    changePredefinedTag(name: string, to: boolean): Promise<void>;
    deleteTag(tag: string): Promise<void>;
    getAll(): Promise<string>;
    getTags(): Promise<{
        name: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[string];
        predefined: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[string];
    }[]>;
    getByName(names: Array<string>): Promise<({ [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[K]; } : never)[]>;
    getOneByName(name: string): Promise<({ [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[K]; } : never) | undefined>;
    getByNameNonPredefined(names: Array<string>): Promise<({ [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[K]; } : never)[]>;
}
