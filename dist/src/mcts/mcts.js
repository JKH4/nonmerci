"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const node_1 = require("./node");
class MCTS {
    constructor(game, rounds, player) {
        const self = this;
        this.game = game;
        this.nodeSort = (node) => {
            if (node.parent) {
                return node.getUCB1(node.parent.game.getCurrentPlayer());
            }
            return 0;
        };
        this.rounds = rounds || 1000;
        this.player = player || 0;
        this.rootNode = new node_1.default(game, null, null, 0, this);
    }
    selectMove() {
        let round;
        let currentNode;
        for (round = 0; round < this.rounds; round += 1) {
            currentNode = this.rootNode;
            this.rootNode.visits += 1;
            while (!_.isEmpty(currentNode.getChildren())) {
                currentNode = currentNode.nextMove();
                currentNode.visits += 1;
            }
            const winner = currentNode.getWinner();
            while (currentNode) {
                currentNode.wins[winner] = (currentNode.wins[winner] || 0) + 1;
                currentNode = currentNode.parent;
            }
        }
        return _(this.rootNode.getChildren()).sortBy('visits').last().move;
    }
}
exports.default = MCTS;
// export interface IGame {
//   getPossibleMoves(): any[] | RandomSelection;
//   performMove(move: any): void;
//   getCurrentPlayer(): any;
//   getWinner(): any;
// }
// exports.MCTS = MCTS
// exports.RandomSelection = RandomSelection
//# sourceMappingURL=mcts.js.map