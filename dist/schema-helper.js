"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reference = exports.id = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const id = () => (0, mysql_core_1.int)("id").autoincrement().primaryKey();
exports.id = id;
const reference = (name, field, nullable = false) => nullable ? (0, mysql_core_1.int)(name).references(() => field) : (0, mysql_core_1.int)(name).notNull().references(() => field);
exports.reference = reference;
//# sourceMappingURL=schema-helper.js.map