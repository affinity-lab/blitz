import express, {Express, NextFunction, Request, Response} from "express";

export function storageFileServer(
	exp: Express,
	endpoint: string,
	fileStoragePath: string,
	fileMaxAge: string | number,
	guards: Record<string, ((id: number, file: string, req:Request) => boolean|Promise<boolean>)> = {},
	reqMiddleware?: (req: Request) => Request | Promise<Request>
): void {
	exp.use(
		endpoint + "/:name/:id/:file",
		async (req: Request, res: Response, next: NextFunction) => {
			if(reqMiddleware) req = await reqMiddleware(req);
			if (guards[req.params.name] !== undefined) {
				let guard = guards[req.params.name];
				if (await guard(parseInt(req.params.id, 36), req.params.file, req)) {
					res.setHeader("Cache-Control", `public, max-age=0`);
					next();
				} else {
					res.sendStatus(404);
				}
			} else {
				next();
			}
		},
		async (req: Request, res: Response, next: NextFunction) => {
			if(reqMiddleware) req = await reqMiddleware(req);
			let b36: string = req.params.id.padStart(6, "0");
			req.url = `//${req.params.name}/${b36.slice(0, 2)}/${b36.slice(2, 4)}/${b36.slice(4, 6)}/${req.params.file}`;
			res.getHeader("Cache-Control") === undefined && res.setHeader("Cache-Control", `public, max-age=${fileMaxAge}`);
			next();
		},
		express.static(fileStoragePath),
		(req: Request, res: Response): void => {
			res.removeHeader("Cache-Control");
			res.sendStatus(404);
		}
	);
}
