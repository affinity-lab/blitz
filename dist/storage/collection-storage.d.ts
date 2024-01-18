import { MySqlTable } from "drizzle-orm/mysql-core";
import { MySql2Database } from "drizzle-orm/mysql2";
import { Cache } from "@affinity-lab/affinity-util";
import { Attachments, TmpFile } from "./types";
export declare class CollectionStorage {
    readonly path: string;
    readonly db: MySql2Database<any>;
    readonly schema: MySqlTable;
    readonly cache?: Cache<any> | undefined;
    private queries;
    constructor(path: string, db: MySql2Database<any>, schema: MySqlTable, cache?: Cache<any> | undefined);
    protected getPath(name: string, id: number): string;
    protected key(name: string, id: number): string;
    protected removeStructure(dir: string): void;
    protected sanitizeFilename(filename: string): string;
    protected getUniqueFilename(directory: string, filename: string): string;
    get(name: string, id: number, res?: {
        found?: "db" | "cache" | false;
    }): Promise<Attachments>;
    get(name: string, id: Array<number>): Promise<Record<number, Attachments>>;
    get(name: string, id: number | Array<number>): Promise<Attachments | Record<number, Attachments>>;
    protected getIndexOfAttachments(name: string, id: number, filename: string, fail?: boolean): Promise<{
        attachments: Attachments;
        index: number;
    }>;
    destroy(name: string, id: number): Promise<void>;
    protected updateRecord(name: string, id: number, attachments: Attachments): Promise<void>;
    add(name: string, id: number, file: TmpFile, metadata: Record<string, any>): Promise<void>;
    delete(name: string, id: number, filename: string): Promise<void>;
    setPosition(name: string, id: number, filename: string, position: number): Promise<void>;
    updateMetadata(name: string, id: number, filename: string, metadata: Record<string, any>): Promise<void>;
    rename(name: string, id: number, filename: string, newName: string): Promise<void>;
}
