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
        this.rounds = rounds || 1000; // 1000;
        this.player = player || 0;
        this.rootNode = new node_1.default(game, null, null, 0, this);
    }
    selectMove() {
        const start = new Date().getTime();
        let end = new Date().getTime();
        let round;
        let currentNode;
        for (round = 0; round < this.rounds && (end - start < 30000); round += 1) {
            if (((round + 1) % 100) === 0) {
                process.stdout.write('!\r\n');
            }
            else {
                process.stdout.write('.');
            }
            // test optimisation JKH
            if (this.rootNode.getChildren().length === 0) {
                throw new Error('NO_NEXT_MOVE');
                // const onlyMove = _(this.rootNode.getChildren()).sortBy('visits').last().move;
                // process.stdout.write('only move: [' + JSON.stringify(onlyMove) + '], time: '
                //   + (new Date().getTime() - start) + ' ms\r\n');
                // return onlyMove;
            }
            if (this.rootNode.getChildren().length === 1) {
                const onlyMove = _(this.rootNode.getChildren()).sortBy('visits').last().move;
                console.log('\r\nOnly move: [' + JSON.stringify(onlyMove) + ']');
                console.log('Thinking Time: ' + (new Date().getTime() - start) + ' ms');
                console.log('Win ratio: ...');
                return onlyMove;
            } // fin test optimisation JKH
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
            end = new Date().getTime();
        }
        const bestChild = _(this.rootNode.getChildren()).sortBy('visits').last();
        // const move = _(this.rootNode.getChildren()).sortBy('visits').last().move;
        // console.log(this.rootNode.visits, this.rootNode.wins);
        // console.log(this.rootNode.getChildren()
        //   .sort((n1, n2) => n2.visits - n1.visits).map((n) => ({ move: n.move, v: n.visits, wins: n.wins })));
        console.log('\r\nChoosen move for ' + this.player + ' : [' + JSON.stringify(bestChild.move) + ']');
        console.log('Thinking Time: ' + (end - start) + ' ms');
        console.log('Root visits: ' + this.rootNode.visits);
        console.log('Root wins: ' + JSON.stringify(this.rootNode.wins));
        console.log('Choosen child visits: ' + bestChild.visits);
        console.log('Choosen child wins: ' + JSON.stringify(bestChild.wins));
        // console.log('Choosen child win ratio: ' + bestChild.wins[this.player]);
        return bestChild.move;
    }
}
exports.default = MCTS;
//# sourceMappingURL=mcts.js.map