import {boolean, int, MySqlColumn, varchar} from "drizzle-orm/mysql-core";

export const id = () => int("id").autoincrement().primaryKey();
export const reference = (name: string, field: () => MySqlColumn, nullable: boolean = false) =>
	nullable
	? int(name).references(field)
	: int(name).notNull().references(field);

export const tagCols = () => {return {
	id: id(),
	name: varchar("name", {length: 255}).notNull().unique(),
	predefined: boolean("predefined")
};};