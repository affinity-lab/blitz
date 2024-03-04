import express, {Express, NextFunction, Request, Response} from "express";
import * as fs from "fs";
import path from "path";
import sharp from "sharp";
import {fatalError} from "@affinity-lab/util";

export function storageImgServer(
	exp: Express,
	endpoint: string,
	imgStoragePath: string,
	fileStoragePath: string,
	maxAge: string | number
): void {
	exp.use(
		endpoint + "/:catalog/:id/:img/:file",
		(req: Request, res: Response, next: NextFunction): void => {
			const {params} = req;
			const ext = path.extname(params.file);
			const file = path.parse(params.file).name;
			const {catalog, id, img} = params;
			req.url = `//${catalog}.${id.padStart(6, "0")}.${file}.${img}${ext}`;
			res.getHeader("Cache-Control") === undefined && res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
			next();
		},
		express.static(imgStoragePath),
		async (req: Request, res: Response) => {
			const {params} = req;
			const file = path.parse(params.file).name;
			const {catalog, id, img} = params;

			let b36: string = req.params.id.padStart(6, "0");

			const source: string = path.join(fileStoragePath, catalog, b36.slice(0, 2), b36.slice(2, 4), b36.slice(4, 6), file);
			if (!fs.existsSync(source)) {
				res.removeHeader("Cache-Control");
				res.sendStatus(404);
				return;
			}

			sharp.cache({files: 0});
			let meta = await sharp(source).metadata();
			const oWidth: number = meta.width!;
			const oHeight: number = meta.height!;

			const match = img.match(/^(\d+)x(\d+)(?:-(\w+))?$/);
			if (match === null) throw fatalError("Could not parse img params", {url: req.url});
			let width = match![1] === "0" ? oWidth : parseInt(match![1]);
			let height = match![2] === "0" ? oHeight : parseInt(match![2]);
			const focus = meta.pages! > 1 ? "center" : (match![3] || "entropy");


			if (focus === "box") {
				const oAspect = oWidth / oHeight;
				const aspect = width / height;


				if (oAspect > aspect) {
					height = Math.floor(width * oAspect);


				} else {
					width = Math.floor(height * oAspect);
				}

				await sharp(source, {animated: true})
					.resize(width, height, {
						kernel: sharp.kernel.lanczos3,
						fit: "contain",
						withoutEnlargement: true
					})
					.toFile(imgStoragePath + "/" + req.url);
			} else {


				if (oWidth < width) {
					height = Math.floor(height * oWidth / width);
					width = oWidth;
				}
				if (oHeight < height) {
					width = Math.floor(width * oHeight / height);
					height = oHeight;
				}

				await sharp(source, {animated: true})
					.resize(width, height, {
						kernel: sharp.kernel.lanczos3,
						fit: "cover",
						position: focus,
						withoutEnlargement: true
					})
					.toFile(imgStoragePath + "/" + req.url);
			}
			res.sendFile(path.resolve(imgStoragePath + "/" + req.url));
		}
	);
}