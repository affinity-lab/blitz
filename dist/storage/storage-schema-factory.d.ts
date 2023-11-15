export declare function storageSchemaFactory(name?: string): import("drizzle-orm/mysql-core").MySqlTableWithColumns<{
    name: string;
    schema: undefined;
    columns: {
        id: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "id";
            tableName: string;
            dataType: "number";
            columnType: "MySqlSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        name: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "name";
            tableName: string;
            dataType: "string";
            columnType: "MySqlVarChar";
            data: string;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, object>;
        itemId: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "itemId";
            tableName: string;
            dataType: "number";
            columnType: "MySqlInt";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
        data: import("drizzle-orm/mysql-core").MySqlColumn<{
            name: "data";
            tableName: string;
            dataType: "json";
            columnType: "MySqlJson";
            data: unknown;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, object>;
    };
    dialect: "mysql";
}>;
