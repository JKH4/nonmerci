"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("../core/game");
class Bot {
    constructor(brainType) {
        this.getBotInfo = () => ({ brainType: this.brainType });
        this.proposeAction = (boardstate) => {
            switch (this.brainType) {
                case BrainOptions.Random:
                    return this.proposeActionRandom();
                case BrainOptions.Take:
                    return game_1.GameAction.Take;
                default:
                    throw new Error('INVALID_BRAIN_TYPE');
            }
        };
        this.proposeActionRandom = () => Math.floor(Math.random() * 2) ? game_1.GameAction.Take : game_1.GameAction.Pay;
        switch (brainType) {
            case BrainOptions.Random:
                this.brainType = BrainOptions.Random;
                break;
            case BrainOptions.Take:
                this.brainType = BrainOptions.Take;
                break;
            case undefined:
                this.brainType = BrainOptions.Random;
                break;
            default:
                throw new Error('INVALID_BRAIN_TYPE');
        }
    }
}
exports.default = Bot;
var BrainOptions;
(function (BrainOptions) {
    BrainOptions["Random"] = "Random";
    BrainOptions["Take"] = "Take";
})(BrainOptions = exports.BrainOptions || (exports.BrainOptions = {}));
//# sourceMappingURL=bot.js.map