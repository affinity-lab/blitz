import { Express, Request } from "express";
export declare function storageFileServer(exp: Express, endpoint: string, fileStoragePath: string, fileMaxAge: string | number, guards?: Record<string, ((id: number, file: string, req: Request) => boolean | Promise<boolean>)>): void;
