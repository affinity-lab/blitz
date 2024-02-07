import { MySqlRepository } from "./my-sql-repository";
import { MySqlTable } from "drizzle-orm/mysql-core";
import { TagManager } from "../tag-manager";
export declare abstract class AbstractTagRepository<S extends Record<string, any> = any, T extends MySqlTable = any> extends MySqlRepository<S, T> {
    tagManager: TagManager;
    private queries;
    abstract get usages(): Array<{
        "repo": MySqlRepository;
        "field": string;
    }>;
    protected initialize(): void;
    createTag(tag: string): Promise<void>;
    renameTag(oldName: string, newName: string): Promise<void>;
    changePredefinedTag(name: string, to: boolean): Promise<void>;
    deleteTag(tag: string): Promise<void>;
    getAll(): Promise<{ [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[string][]>;
    getByName(names: Array<string>): Promise<({ [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[K]; } : never)[]>;
    getOneByName(name: string): Promise<({ [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[K]; } : never) | undefined>;
    getByNameNonPredefined(names: Array<string>): Promise<({ [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; } extends infer T_1 ? { [K in keyof T_1]: { [Key in keyof import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T> & string]: import("drizzle-orm/query-builders/select.types").SelectResultField<import("drizzle-orm/query-builders/select.types").GetSelectTableSelection<T>[Key], true>; }[K]; } : never)[]>;
}
