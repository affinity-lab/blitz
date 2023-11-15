import { Collection } from "../collection";
import { ImgFocus, ImgRGB, Rules } from "../types";
import { TmpFile } from "@affinity-lab/affinity-util";
import { MySqlRepository } from "../../repository/my-sql-repository";
export declare class ImageCollection extends Collection<{
    title: string;
    width: string;
    height: string;
    color: ImgRGB;
    animated: boolean;
    focus: ImgFocus;
}> {
    static factory(repository: MySqlRepository, name: string, rules: Rules): ImageCollection;
    protected prepareFile(file: TmpFile): Promise<{
        file: TmpFile;
        metadata: Record<string, any>;
    }>;
    setTitle(id: number, filename: string, title: string): Promise<void>;
}
