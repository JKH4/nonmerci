"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
class NomMerci {
    constructor() {
        // console.log('NomMerci constructor');
    }
    createNewGame(options) {
        return new game_1.default(options);
    }
}
exports.default = NomMerci;
//# sourceMappingURL=non-merci.js.map