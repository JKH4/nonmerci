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
    getPossibleDraws() {
        // console.log('MctsGame getPossibleMoves()');
        return ['Draw1', 'Draw2', 'Draw3'];
    }
    performMove(move) {
        // console.log('MctsGame performMove()');
    }
    performDraw(move) {
        // console.log('MctsGame performMove()');
    }
    getCurrentPlayer() {
        return 666;
    }
    getWinner() {
        return 777;
    }
    // public isExpectiminimax(): boolean {
    //   return false;
    // }
    isCurrentNodeADecisionNode() {
        return true;
    }
    isNextNodeADecisionNode(nextAction) {
        return true;
    }
}
exports.MctsGame = MctsGame;
//# sourceMappingURL=mcts-game.js.map