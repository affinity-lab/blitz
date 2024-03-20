import { MaybePromise } from "@affinity-lab/util";
import { MySqlUpdateSetSource } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel, Table } from "drizzle-orm";
import { MySqlRepository } from "./repository/my-sql-repository";
import { ITagRepository } from "./repository/tag-repository-interface";
export declare abstract class ITagManager {
    protected tableRepo: ITagRepository;
    protected usages: Array<{
        "repo": MySqlRepository;
        "field": string;
    } & Record<string, any>>;
    constructor(tableRepo: ITagRepository);
    abstract addUsage(...args: any): MaybePromise<void>;
    protected prepare(repository: MySqlRepository, values: MySqlUpdateSetSource<any> | InferInsertModel<any>): void;
    protected prevCurrForUpdate(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values?: MySqlUpdateSetSource<any>): {
        prev: string[];
        curr: string[];
    };
    abstract update(...args: any): MaybePromise<void>;
    protected deleteItems(items: Array<any>): Promise<void>;
    abstract delete(...args: any): MaybePromise<void>;
    abstract deletePredefined(...args: any): MaybePromise<void>;
    abstract changePredefined(...args: any): MaybePromise<void>;
    abstract add(...args: any): MaybePromise<void>;
    protected doRename(oldName: string, newName: string): void;
    abstract rename(...args: any): MaybePromise<void>;
    abstract deleteInUsages(...args: any): Promise<void>;
    selfRename<T extends Table<any> = any>(values: MySqlUpdateSetSource<any>, originalItem: InferSelectModel<T> | any): Promise<void>;
}
