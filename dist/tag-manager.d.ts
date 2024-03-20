import { MySqlRepository } from "./repository/my-sql-repository";
import { MySqlUpdateSetSource } from "drizzle-orm/mysql-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { MaybeArray } from "@affinity-lab/util";
import { ITagManager } from "./tag-manager-interface";
export declare class TagManager extends ITagManager {
    protected usages: Array<{
        "repo": MySqlRepository;
        "field": string;
    }>;
    addUsage(usage: MaybeArray<{
        "repo": MySqlRepository;
        "field": string;
    }>): void;
    update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values?: MySqlUpdateSetSource<any>): Promise<void>;
    delete(tags: Array<string>): Promise<void>;
    deletePredefined(name: string): Promise<void>;
    changePredefined(name: string, to: boolean): Promise<void>;
    add(tags: Array<string>, predefined?: boolean): Promise<void>;
    rename(oldName: string, newName: string): Promise<void>;
    deleteInUsages(originalItem: InferSelectModel<any> | any): Promise<void>;
}
