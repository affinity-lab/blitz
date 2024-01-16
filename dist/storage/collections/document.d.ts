import { Collection } from "../collection";
import { MetaField, Rules } from "../types";
import { MySqlRepository } from "../../repository/my-sql-repository";
export declare class DocumentCollection extends Collection<{
    title: string;
}> {
    publicMetaFields: Array<MetaField>;
    static factory(repository: MySqlRepository, name: string, rules: Rules): DocumentCollection;
    setTitle(id: number, filename: string, title: string): Promise<void>;
}
