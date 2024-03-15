"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITagRepository = void 0;
const my_sql_repository_1 = require("./my-sql-repository");
class ITagRepository extends my_sql_repository_1.MySqlRepository {
    tagManager;
}
exports.ITagRepository = ITagRepository;
//# sourceMappingURL=tag-repository-interface.js.map