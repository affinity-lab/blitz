import {EventEmitter} from "events";
import path from "path";
import fs from "fs";
import {BLITZ_EVENTS} from "../events";
import {glob} from "glob";

export function imgEventListeners(imgPath: string, eventEmitter: EventEmitter) {

	eventEmitter.on(
		BLITZ_EVENTS.STORAGE_DESTROY,
		(collection: string, id: number) => {
			const pattern = path.join(imgPath, `${collection}.${id.toString(36).padStart(6, "0")}*`);
			const files = glob.sync(pattern);
			files.forEach((file: string) => {
				try {
					fs.unlinkSync(file);
				} catch (err) {

				}
			});
		});

	eventEmitter.on(
		BLITZ_EVENTS.STORAGE_DELETE,
		(collection: string, id: number, filename: string) => {
			const pattern = path.join(imgPath, `${collection}.${id.toString(36).padStart(6, "0")}.${filename}*`).replaceAll("\\", "/");
			const files = glob.sync(pattern);
			files.forEach((file: string) => {
				try {
					fs.unlinkSync(file);
				} catch (err) {

				}
			});
		});

	eventEmitter.on(
		BLITZ_EVENTS.STORAGE_RENAME,
		(collection: string, id: number, filename: string) => {
			const pattern = path.join(imgPath, `${collection}.${id.toString(36).padStart(6, "0")}.${filename}*`).replaceAll("\\", "/");
			const files = glob.sync(pattern);
			files.forEach((file: string) => {
				try {
					fs.unlinkSync(file);
				} catch (err) {

				}
			});
		});
}