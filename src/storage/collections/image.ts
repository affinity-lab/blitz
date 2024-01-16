import {Collection} from "../collection";
import {ImgFocus, imgFocusOptions, ImgRGB, MetaField, Rules} from "../types";
import {FileDescriptor, TmpFile} from "@affinity-lab/affinity-util";
import {MySqlRepository} from "../../repository/my-sql-repository";

export class ImageCollection extends Collection<{
	title: string,
	width: string,
	height: string,
	color: ImgRGB,
	animated: boolean,
	focus: ImgFocus
}> {

	public publicMetaFields: Array<MetaField> = [{name: "title", type: "string"}, {name: "focus", type: "enum", options: imgFocusOptions}];


	static factory(repository: MySqlRepository, name: string, rules: Rules) {
		return new ImageCollection(
			`${repository.name}.${name}`,
			repository.eventEmitter,
			repository,
			repository.collectionStorage!,
			rules
		);
	}

	protected async prepareFile(file: TmpFile): Promise<{ file: TmpFile; metadata: Record<string, any> }> {
		const descriptor = new FileDescriptor(file.file);
		let img = await descriptor.image;
		return {
			file, metadata: {
				width: img?.meta.width,
				height: img?.meta.height,
				color: img?.stats.dominant,
				animated: (img?.meta.pages) ? img.meta.pages > 1 : false,
				focus: "entropy"
			}
		};
	}

	async setFocus(id: number, filename: string, focus: ImgFocus) {
		await this.updateMetadata(id, filename, {focus});
	}

	async setTitle(id: number, filename: string, title: string) {
		await this.updateMetadata(id, filename, {title});
	}
}
