import { AbstractTagRepository } from "./repository/abstract-tag-repository";
import { MySqlRepository } from "./repository/my-sql-repository";
import { MySqlUpdateSetSource } from "drizzle-orm/mysql-core";
import { InferInsertModel } from "drizzle-orm";
type MaybeArray<T> = T | Array<T>;
export declare class TagManager {
    private tableRepo;
    private usages;
    constructor(tableRepo: AbstractTagRepository);
    addUsage(usage: MaybeArray<{
        "repo": MySqlRepository;
        "field": string;
    }>): void;
    prepare(repository: MySqlRepository, values: MySqlUpdateSetSource<any> | InferInsertModel<any>): void;
    update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values?: MySqlUpdateSetSource<any>): Promise<void>;
    delete(tags: Array<string>): Promise<void>;
    changePredefined(name: string, to: boolean): Promise<void>;
    add(tags: Array<string>, predefined?: boolean): Promise<void>;
    rename(oldName: string, newName: string): Promise<void>;
}
export {};
