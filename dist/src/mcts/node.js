"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const random_selection_1 = require("./random-selection");
class Node {
    constructor(game, parent, move, depth, mcts) {
        this.gameConstructor = game.constructor;
        this.game = game;
        this.mcts = mcts;
        this.parent = parent;
        this.move = move;
        this.wins = {};
        this.visits = 0;
        this.children = null;
        this.depth = depth || 0;
        this.randomNode = false;
    }
    getUCB1(player) {
        let scorePerVisit = 0;
        // always visit unvisited nodes first
        if (this.visits === 0) {
            return Infinity;
        }
        if (!this.parent) {
            return 0;
        }
        scorePerVisit = (this.wins[player] || 0) / this.visits;
        // See https://en.wikipedia.org/wiki/Monte_Carlo_tree_search#Exploration_and_exploitation
        return scorePerVisit + Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
    }
    getChildren() {
        if (this.children === null) {
            if (this.move !== null) {
                this.game.performMove(this.move);
            }
            let moves;
            moves = this.game.getPossibleMoves();
            if (moves instanceof random_selection_1.default) {
                moves = moves.array;
                this.randomNode = true;
            }
            this.children = _.map(moves, (move) => {
                return new Node(_.assign(new this.gameConstructor(), _.cloneDeep(this.game)), this, move, this.depth + 1, this.mcts);
            });
        }
        return this.children;
    }
    getWinner() {
        // forces the move to be performed
        this.getChildren();
        return this.game.getWinner();
    }
    nextMove() {
        // shuffle because sortBy is a stable sort but we want equal nodes to be chosen randomly
        if (this.randomNode) {
            return _(this.getChildren()).shuffle().last();
        }
        return _(this.getChildren()).shuffle().sortBy(this.mcts.nodeSort).last();
    }
}
exports.default = Node;
//# sourceMappingURL=node.js.map