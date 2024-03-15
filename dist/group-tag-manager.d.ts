import { MySqlUpdateSetSource } from "drizzle-orm/mysql-core";
import { InferInsertModel } from "drizzle-orm";
import { MaybeArray } from "@affinity-lab/util";
import { ITagManager } from "./tag-manager-interface";
import { MySqlRepository } from "./repository/my-sql-repository";
export declare class GroupTagManager extends ITagManager {
    addUsage(usage: MaybeArray<{
        "repo": MySqlRepository;
        "field": string;
    }>): void;
    update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values: MySqlUpdateSetSource<any> | undefined, eventId: number): Promise<void>;
    delete(tags: Array<string>, eventId: number): Promise<void>;
    deletePredefined(name: string, eventId: number): Promise<void>;
    changePredefined(name: string, to: boolean, eventId: number): Promise<void>;
    add(tags: Array<string>, predefined: boolean | undefined, eventId: number): Promise<void>;
    rename(oldName: string, newName: string, eventId: number): Promise<void>;
}
