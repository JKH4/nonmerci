"use strict";
// import * as _ from 'lodash';
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.player = player || this.game.getCurrentPlayer(); // 0;
        this.rootNode = new node_1.default(game, null, null, 0, this);
    }
    selectMove() {
        const start = new Date().getTime();
        let end = new Date().getTime();
        let round;
        let currentNode;
        // test optimisation JKH
        const children = this.rootNode.getChildren();
        if (children.length === 0) {
            throw new Error('NO_NEXT_MOVE');
        }
        if (children.length === 1) {
            const onlyChild = children[children.length - 1];
            console.log('\r\nOnly move: [' + JSON.stringify(onlyChild.move) + ']');
            console.log('Thinking Time: ' + (new Date().getTime() - start) + ' ms');
            console.log('Choosen child visits: ' + onlyChild.visits);
            console.log('Choosen child win ratio: ' + onlyChild.wins[this.player] / onlyChild.visits);
            console.log('Choosen child wins: ' + JSON.stringify(onlyChild.wins));
            return onlyChild.move;
        } // fin test optimisation JKH
        for (round = 0; round < this.rounds && (end - start < 30000); round += 1) {
            if (((round + 1) % 100) === 0) {
                process.stdout.write('!\r\n');
            }
            else {
                process.stdout.write('.');
            }
            currentNode = this.rootNode;
            this.rootNode.visits += 1;
            // while (!_.isEmpty(currentNode.getChildren())) {
            while (currentNode.getChildren() !== undefined && currentNode.getChildren().length > 0) {
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
        process.stdout.write('\r\n');
        console.log('Thinking Time: ' + (end - start) + ' ms, '
            + 'Root visits: ' + this.rootNode.visits + ', '
            // + 'visit per seconds: ' + this.rootNode.visits / ((end - start) / 1000)
            + 'ms per visit: ' + Math.floor((end - start) / this.rootNode.visits * 10000) / 100 + ' ms');
        children.sort((n1, n2) => n1.visits - n2.visits);
        console.log('All children view: -------------------------------------------');
        children.forEach((c) => console.log('[move:' + JSON.stringify(c.move)
            + ', visits:' + c.visits
            + ', wins:' + c.wins[this.player]
            + ', win ratio=' + Math.floor((c.wins[this.player] / c.visits) * 10000) / 100 + '%'
            + ']'));
        console.log('--------------------------------------------------------------');
        const bestChild = children[children.length - 1];
        const bestChildWinRatio = bestChild.wins[this.player] / bestChild.visits;
        const rootNodeWinRatio = this.rootNode.wins[this.player] / this.rootNode.visits;
        console.log('Choosen move view: -------------------------------------------');
        console.log('Player:' + this.player
            + ' : [' + JSON.stringify(bestChild.move) + ']'
            + ', win ratio=' + Math.floor(bestChildWinRatio * 10000) / 100 + '%'
            + ' (trend: ' + (Math.floor((bestChildWinRatio - rootNodeWinRatio) * 10000) / 100) + '%)');
        // console.log('Root win ratio= ' + Math.floor((rootNodeWinRatio) * 10000) / 100 + '%, '
        // console.log('Win ratio trend= ' + (Math.floor((bestChildWinRatio - rootNodeWinRatio) * 10000) / 100) + '%');
        // console.log('Root wins: ' + JSON.stringify(this.rootNode.wins));
        // console.log('Choosen child wins: ' + JSON.stringify(bestChild.wins));
        console.log('--------------------------------------------------------------');
        return bestChild.move;
    }
}
exports.default = MCTS;
//# sourceMappingURL=mcts.js.map