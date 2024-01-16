import {EventEmitter} from "events";
import {MySqlRepository} from "../repository/my-sql-repository";
import {BLITZ_EVENTS} from "../events";
import Path from "path";
import {blitzError} from "../errors";
import fs from "fs";
import {Attachments, MetaField, Rules, TmpFile} from "./types";
import {CollectionStorage} from "./collection-storage";

export class Collection<METADATA extends Record<string, any>> {

	static factory<MD extends Record<string, any>>(repository: MySqlRepository, name: string, rules: Rules) {
		return new Collection<MD>(
			repository.name + name,
			repository.eventEmitter,
			repository,
			repository.collectionStorage!,
			rules
		);
	}

	public publicMetaFields: Array<MetaField> = [];

	constructor(
		readonly name: string,
		readonly emitter: EventEmitter,
		readonly repository: MySqlRepository,
		readonly storage: CollectionStorage,
		readonly rules: Rules
	) {
		// if it was a string cast it to array
		if (typeof this.rules.ext === "string") this.rules.ext = [this.rules.ext];
		// if it was an empty string cast it to undefined
		if (Array.isArray(this.rules.ext) && this.rules.ext.length === 0) this.rules.ext = undefined;
		this.emitter.on(
			BLITZ_EVENTS.AFTER_DELETE,
			async (repo: MySqlRepository, id: number) => {
				if (repo === this.repository) {
					this.emitter.emit(BLITZ_EVENTS.STORAGE_DESTROY, this.name, id);
					await this.storage.destroy(this.name, id);
				}
			}
		);
	}

	public async setMetadata(id: number, filename: string, metadata: Partial<METADATA>) {
		let set: Record<string, any> = {};
		for (const publicMetaField of this.publicMetaFields) {
			if (metadata.hasOwnProperty(publicMetaField.name)){
				switch (publicMetaField.type){
					case "enum":
						if(publicMetaField.options.includes(metadata[publicMetaField.name]!)){
							set[publicMetaField.name] = metadata[publicMetaField.name];
						}
						break;
					default:
						set[publicMetaField.name] = metadata[publicMetaField.name];
						break;
				}
			}
		}
		await this.storage.updateMetadata(this.name, id, filename, set);
	}

	protected async updateMetadata(id: number, filename: string, metadata: Partial<METADATA>) {
		await this.storage.updateMetadata(this.name, id, filename, metadata);
	}

	protected async prepareFile(file: TmpFile): Promise<{ file: TmpFile, metadata: Record<string, any> }> {return {file, metadata: {}};}

	async add(id: number, file: TmpFile) {
		let metadata: Record<string, any>;
		const ext = Path.extname(file.filename);
		const filename = Path.basename(file.filename);

		// check if entity exists
		if (await this.repository.get(id) === undefined) {
			throw blitzError.storage.ownerNotExists(this.repository.name, id);
		}

		// check limit
		const attachments = await this.storage.get(this.name, id);
		if (attachments.length >= this.rules.limit) {
			throw blitzError.storage.tooManyFiles(this.repository.name, id, filename, this.rules.limit);
		}

		// check extension
		if (this.rules.ext !== undefined && !this.rules.ext.includes(ext)) {
			throw blitzError.storage.extensionNotAllowed(this.repository.name, id, filename, this.rules.ext);
		}

		// prepare (modify, replace, whatever) the file
		({file, metadata} = await this.prepareFile(file));

		// check size
		let size = fs.statSync(file.file).size;
		if (size > this.rules.size) {
			throw blitzError.storage.fileTooLarge(this.repository.name, id, filename, this.rules.size);
		}

		await this.storage.add(this.name, id, file, metadata);
	}

	async delete(id: number, filename: string) {
		this.emitter.emit(BLITZ_EVENTS.STORAGE_DELETE, this.name, id, filename);
		await this.storage.delete(this.name, id, filename);
	}

	async get(id: number): Promise<Attachments> ;
	async get(ids: Array<number>): Promise<Record<number, Attachments>>;
	async get(id: number | Array<number>): Promise<Record<number, Attachments> | Attachments> {
		return await this.storage.get(this.name, id);
	}

	async setPosition(id: number, filename: string, position: number) {
		await this.storage.setPosition(this.name, id, filename, position);
	}
}