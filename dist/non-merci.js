"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander = require("commander");
const game_1 = require("./game");
class NomMerci {
    constructor() {
        console.log('NomMerci constructor');
        // this.program = new commander();
    }
    createNewGame(options) {
        return new game_1.default(options);
    }
    main() {
        console.log('main !');
        // console.log('main !');
        commander
            .version('0.1.0')
            .command('install [name]', 'install one or more packages')
            .command('search [query]', 'search with optional query')
            .command('list', 'list packages installed', { isDefault: true })
            .parse(process.argv);
    }
}
exports.default = NomMerci;
//# sourceMappingURL=non-merci.js.map