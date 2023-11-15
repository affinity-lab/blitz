import { MySqlColumn } from "drizzle-orm/mysql-core";
export declare const id: () => import("drizzle-orm").NotNull<import("drizzle-orm").HasDefault<import("drizzle-orm/mysql-core").MySqlIntBuilderInitial<"id">>>;
export declare const reference: (name: string, field: MySqlColumn, nullable?: boolean) => import("drizzle-orm/mysql-core").MySqlIntBuilderInitial<string>;
