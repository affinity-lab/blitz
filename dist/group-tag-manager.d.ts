import { MySqlUpdateSetSource } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { MaybeArray } from "@affinity-lab/util";
import { ITagManager } from "./tag-manager-interface";
import { MySqlRepository } from "./repository/my-sql-repository";
export declare class GroupTagManager extends ITagManager {
    addUsage(usage: MaybeArray<{
        "repo": MySqlRepository;
        "field": string;
        mode: "JSON" | undefined;
    }>): void;
    deleteInUsages(originalItem: InferSelectModel<any> | any): Promise<void>;
    update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values: MySqlUpdateSetSource<any> | undefined, eventId: number): Promise<void>;
    protected prevCurrForUpdate(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values?: MySqlUpdateSetSource<any>): {
        prev: string[];
        curr: string[];
    };
    protected prepare(repository: MySqlRepository, values: MySqlUpdateSetSource<any> | InferInsertModel<any>): void;
    protected doRename(oldName: string, newName: string): Promise<void>;
    delete(tags: Array<string>, eventId: number): Promise<void>;
    deletePredefined(name: string, eventId: number): Promise<void>;
    changePredefined(name: string, to: boolean, eventId: number): Promise<void>;
    add(tags: Array<string>, predefined: boolean | undefined, eventId: number): Promise<void>;
    rename(oldName: string, newName: string, eventId: number): Promise<void>;
}
