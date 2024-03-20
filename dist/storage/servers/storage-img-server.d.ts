import { Express, Request } from "express";
export declare function storageImgServer(exp: Express, endpoint: string, imgStoragePath: string, fileStoragePath: string, maxAge: string | number, reqMiddleware?: (req: Request) => Request | Promise<Request>): void;
