"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { GameAction } from '../core/game';
const board_helper_1 = require("../core/board-helper");
const mcts_1 = require("../mcts/mcts");
class Bot {
    constructor(brainType) {
        this.getBotInfo = () => ({ brainType: this.brainType });
        this.proposeAction = (board) => {
            switch (this.brainType) {
                case BrainOptions.Random:
                    return this.proposeActionRandom();
                case BrainOptions.Mcts1:
                    const mcts = new mcts_1.default(board);
                    // console.log('juste avant selectMove');
                    const move = mcts.selectMove();
                    // console.log('proposeAction', move);
                    return move;
                case BrainOptions.Take:
                    return { type: board_helper_1.ActionType.TAKE };
                // return GameAction.Take;
                default:
                    throw new Error('INVALID_BRAIN_TYPE');
            }
        };
        this.proposeActionRandom = () => Math.floor(Math.random() * 2)
            ? { type: board_helper_1.ActionType.TAKE }
            : { type: board_helper_1.ActionType.PAY };
        switch (brainType) {
            case BrainOptions.Random:
                this.brainType = BrainOptions.Random;
                break;
            case BrainOptions.Mcts1:
                this.brainType = BrainOptions.Mcts1;
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
    BrainOptions["Mcts1"] = "Mcts1";
})(BrainOptions = exports.BrainOptions || (exports.BrainOptions = {}));
//# sourceMappingURL=bot.js.map