import { Collection } from "../collection";
import { ImgFocus, ImgRGB, MetaField, Rules } from "../types";
import { TmpFile } from "@affinity-lab/util";
import { MySqlRepository } from "../../repository/my-sql-repository";
export declare class ImageCollection extends Collection<{
    title: string;
    width: string;
    height: string;
    color: ImgRGB;
    animated: boolean;
    focus: ImgFocus;
}> {
    publicMetaFields: Array<MetaField>;
    static factory(repository: MySqlRepository, name: string, rules: Rules): ImageCollection;
    protected prepareFile(file: TmpFile): Promise<{
        file: TmpFile;
        metadata: Record<string, any>;
    }>;
    setFocus(id: number, filename: string, focus: ImgFocus): Promise<void>;
    setTitle(id: number, filename: string, title: string): Promise<void>;
}
