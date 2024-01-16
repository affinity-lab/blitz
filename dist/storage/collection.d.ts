/// <reference types="node" />
import { EventEmitter } from "events";
import { MySqlRepository } from "../repository/my-sql-repository";
import { Attachments, MetaField, Rules, TmpFile } from "./types";
import { CollectionStorage } from "./collection-storage";
export declare class Collection<METADATA extends Record<string, any>> {
    readonly name: string;
    readonly emitter: EventEmitter;
    readonly repository: MySqlRepository;
    readonly storage: CollectionStorage;
    readonly rules: Rules;
    static factory<MD extends Record<string, any>>(repository: MySqlRepository, name: string, rules: Rules): Collection<MD>;
    publicMetaFields: Array<MetaField>;
    constructor(name: string, emitter: EventEmitter, repository: MySqlRepository, storage: CollectionStorage, rules: Rules);
    setMetadata(id: number, filename: string, metadata: Partial<METADATA>): Promise<void>;
    protected updateMetadata(id: number, filename: string, metadata: Partial<METADATA>): Promise<void>;
    protected prepareFile(file: TmpFile): Promise<{
        file: TmpFile;
        metadata: Record<string, any>;
    }>;
    add(id: number, file: TmpFile): Promise<void>;
    delete(id: number, filename: string): Promise<void>;
    get(id: number): Promise<Attachments>;
    get(ids: Array<number>): Promise<Record<number, Attachments>>;
    setPosition(id: number, filename: string, position: number): Promise<void>;
}
