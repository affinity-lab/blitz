import { ITagRepository } from "./tag-repository-interface";
import { GroupTagManager } from "../group-tag-manager";
import { MySqlTableWithColumns } from "drizzle-orm/mysql-core";
import { MySql2PreparedQuery } from "drizzle-orm/mysql2";
export declare abstract class AbstractGroupTagRepository<S extends Record<string, any> = any, T extends MySqlTableWithColumns<any> = any, TM extends GroupTagManager = GroupTagManager> extends ITagRepository<S, T, TM> {
    protected col: string;
    protected q: {
        getAll: MySql2PreparedQuery<any>;
        getByName: MySql2PreparedQuery<any>;
        getOneByName: MySql2PreparedQuery<any>;
        getByNameNonPredefined: MySql2PreparedQuery<any>;
    };
    initialize(tm: new (r: AbstractGroupTagRepository) => TM, repo: AbstractGroupTagRepository, col?: string): void;
    createTag(tag: string, groupId: number): Promise<void>;
    renameTag(oldName: string, newName: string, groupId: number): Promise<void>;
    changePredefinedTag(name: string, to: boolean, groupId: number): Promise<void>;
    deleteTag(tag: string, groupId: number): Promise<void>;
    getAll(groupId: number): Promise<any>;
    getTags(groupId: number): Promise<any>;
    getByName(names: Array<string>, groupId: number): Promise<any>;
    getOneByName(name: string, groupId: number): Promise<any>;
    getByNameNonPredefined(names: Array<string>, groupId: number): Promise<any>;
}
