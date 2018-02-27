"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { IGame } from './mcts';
class MctsGame {
    constructor() {
        // console.log('Constructor MctsGame');
    }
    getPossibleMoves() {
        // console.log('MctsGame getPossibleMoves()');
        return ['MctsGame1', 'MctsGame2'];
    }
    performMove(move) {
        // console.log('MctsGame performMove()');
    }
    getCurrentPlayer() {
        return 666;
    }
    getWinner() {
        return 777;
    }
}
exports.MctsGame = MctsGame;
//# sourceMappingURL=mcts-game.js.map