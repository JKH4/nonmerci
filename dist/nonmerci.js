"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
class NomMerci {
    constructor() {
        console.log('NomMerci constructor');
    }
    createNewGame() {
        console.log('createNewGame');
        return new game_1.default();
    }
}
exports.default = NomMerci;
//# sourceMappingURL=nonmerci.js.map