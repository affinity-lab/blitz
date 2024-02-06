export declare const blitzError: {
    storage: {
        ownerNotExists: (name: string, id: number) => {
            message?: string | undefined;
            details?: Record<string, any> | undefined;
            httpResponseCode: number;
            silent: boolean;
        };
        fileTooLarge: (name: string, id: number, filename: string, sizeLimit: number) => {
            message?: string | undefined;
            details?: Record<string, any> | undefined;
            httpResponseCode: number;
            silent: boolean;
        };
        extensionNotAllowed: (name: string, id: number, filename: string, allowedExtensions: string | Array<string>) => {
            message?: string | undefined;
            details?: Record<string, any> | undefined;
            httpResponseCode: number;
            silent: boolean;
        };
        tooManyFiles: (name: string, id: number, filename: string, limit: number) => {
            message?: string | undefined;
            details?: Record<string, any> | undefined;
            httpResponseCode: number;
            silent: boolean;
        };
        attachedFileNotFound: (name: string, id: number, filename: string) => {
            message?: string | undefined;
            details?: Record<string, any> | undefined;
            httpResponseCode: number;
            silent: boolean;
        };
    };
    tagManager: {
        itemNotFound: (name: string) => {
            message?: string | undefined;
            details?: Record<string, any> | undefined;
            httpResponseCode: number;
            silent: boolean;
        };
    };
};
