import {Collection} from "../collection";
import {Rules} from "../types";
import MySqlRepository from "../../repository/my-sql-repository";

export class DocumentCollection extends Collection<{ title: string }> {

	static factory(repository: MySqlRepository, name: string, rules: Rules) {
		return new DocumentCollection(
			repository.name + name,
			repository.eventEmitter,
			repository,
			repository.collectionStorage!,
			rules
		);
	}

	async setTitle(id: number, filename: string, title: string) {
		await this.updateMetadata(id, filename, {title});
	}
}

