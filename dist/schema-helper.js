"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.In = exports.tagCols = exports.reference = exports.id = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const id = () => (0, mysql_core_1.int)("id").autoincrement().primaryKey();
exports.id = id;
const reference = (name, field, nullable = false) => nullable
    ? (0, mysql_core_1.int)(name).references(field)
    : (0, mysql_core_1.int)(name).notNull().references(field);
exports.reference = reference;
const tagCols = () => {
    return {
        id: (0, exports.id)(),
        name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull().unique(),
        predefined: (0, mysql_core_1.boolean)("predefined")
    };
};
exports.tagCols = tagCols;
function In(col, ids) {
    return (0, drizzle_orm_1.sql) `${col} in (${drizzle_orm_1.sql.placeholder(ids)})`;
}
exports.In = In;
//# sourceMappingURL=schema-helper.js.map