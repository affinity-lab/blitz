"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageSchemaFactory = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
function storageSchemaFactory(name = "_storage") {
    return (0, mysql_core_1.mysqlTable)(name, {
        id: (0, mysql_core_1.serial)("id").primaryKey(),
        name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
        itemId: (0, mysql_core_1.int)("itemId").notNull(),
        data: (0, mysql_core_1.json)("data").default("{}")
    }, (t) => ({
        unq: (0, mysql_core_1.unique)().on(t.name, t.itemId)
    }));
}
exports.storageSchemaFactory = storageSchemaFactory;
//# sourceMappingURL=storage-schema-factory.js.map