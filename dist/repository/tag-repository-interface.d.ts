import { MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { ITagManager } from "../tag-manager-interface";
import { MaybePromise } from "@affinity-lab/util";
import { MySqlRepository } from "./my-sql-repository";
export declare abstract class ITagRepository<S extends Record<string, any> = any, T extends MySqlTableWithColumns<any> = any, TM extends ITagManager = any> extends MySqlRepository<S, T> {
    tagManager: TM;
    abstract initialize(...args: any): void;
    abstract createTag(...args: any): MaybePromise<void>;
    abstract renameTag(...args: any): MaybePromise<void>;
    abstract changePredefinedTag(...args: any): MaybePromise<void>;
    abstract deleteTag(...args: any): MaybePromise<void>;
    abstract getAll(...args: any): MaybePromise<string>;
    abstract getTags(...args: any): MaybePromise<Array<any>>;
    abstract getByName(...args: any): MaybePromise<Array<any & {
        id: number;
    }>>;
    abstract getOneByName(...args: any): MaybePromise<any & {
        id: number;
    }>;
    abstract getByNameNonPredefined(...args: any): MaybePromise<Array<any & {
        id: number;
    }>>;
}
