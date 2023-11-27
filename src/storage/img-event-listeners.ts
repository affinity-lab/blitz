import path from "path";
import fs from "fs";
import {EventEmitter} from "events";
import {BLITZ_EVENTS} from "../events";
import {glob} from "glob";

export function imgEventListeners(imgPath: string, eventEmitter: EventEmitter) {

	eventEmitter.on(
		BLITZ_EVENTS.STORAGE_DESTROY,
		(collection: string, id: number) => {
			const pattern = path.join(imgPath, `${collection}.${id.toString(36)}*`);
			const files = glob.sync(pattern);
			files.forEach((file) => {
				try {
					fs.unlinkSync(file);
				} catch (err) {

				}
			});
		});

	eventEmitter.on(
		BLITZ_EVENTS.STORAGE_DELETE,
		(collection: string, id: number, filename: string) => {
			const pattern = path.join(imgPath, `${collection}.${id.toString(36)}.${filename}*`);
			const files = glob.sync(pattern);
			files.forEach((file) => {
				try {
					fs.unlinkSync(file);
				} catch (err) {

				}
			});
		});
}