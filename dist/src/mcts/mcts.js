"use strict";
// import * as _ from 'lodash';
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("./node");
const winston_1 = require("winston");
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
        let totalNodeVisit = 0;
        let currentNode;
        // test optimisation JKH
        const children = this.rootNode.getChildren();
        if (children.length === 0) {
            throw new Error('NO_NEXT_MOVE');
        }
        if (children.length === 1) {
            const onlyChild = children[children.length - 1];
            console.log('\r\n>>>> Only move: [\x1b[36m' + JSON.stringify(onlyChild.move) + '\x1b[0m'
                + '], Thinking Time: ' + (new Date().getTime() - start) + 'ms');
            return onlyChild.move;
        } // fin test optimisation JKH
        for (round = 0; round < this.rounds && (end - start < 60000); round += 1) {
            currentNode = this.rootNode;
            this.rootNode.visits += 1;
            totalNodeVisit += 1;
            while (currentNode.getChildren() !== undefined && currentNode.getChildren().length > 0) {
                currentNode = currentNode.nextMove();
                currentNode.visits += 1;
                totalNodeVisit += 1;
            }
            const winner = currentNode.getWinner();
            winner === this.player
                ? process.stdout.write('\x1b[32m' + Math.floor(currentNode.depth / 10) + '\x1b[0m')
                : process.stdout.write('\x1b[31m' + Math.floor(currentNode.depth / 10) + '\x1b[0m');
            if (((round + 1) % 100) === 0) {
                process.stdout.write('\r\n');
            }
            while (currentNode) {
                currentNode.wins[winner] = (currentNode.wins[winner] || 0) + 1;
                currentNode = currentNode.parent;
            }
            end = new Date().getTime();
        }
        process.stdout.write('\r\n');
        console.log('Thinking Time: ' + (end - start) + ' ms, '
            + 'visits: ' + this.rootNode.visits + '/' + totalNodeVisit + ' (root/total), '
            + 'time per visit: ' + Math.floor((end - start) / totalNodeVisit * 10000) / 100 + 'ms');
        children.sort((n1, n2) => n1.visits - n2.visits);
        // children.forEach((c) => console.log('[move:\x1b[36m' + JSON.stringify(c.move) + '\x1b[0m]'
        //   + ', visits:' + c.visits
        //   + ', wins:' + c.wins[this.player]
        //   + ', win ratio=' + Math.floor((c.wins[this.player] / c.visits) * 10000) / 100 + '%'
        //   + ']'));
        const bestChild = children[children.length - 1];
        const bestChildWinRatio = bestChild.wins[this.player] / bestChild.visits;
        const rootNodeWinRatio = this.rootNode.wins[this.player] / this.rootNode.visits;
        console.log('>>>> Player:' + this.player
            + ' : [\x1b[36m' + JSON.stringify(bestChild.move) + '\x1b[0m]'
            + ', win ratio=' + Math.floor(bestChildWinRatio * 10000) / 100 + '%'
            + ' (trend: ' + (Math.floor((bestChildWinRatio - rootNodeWinRatio) * 10000) / 100) + '%)');
        logger.log('error', 'MCTS_MV=\x1b[36m' + JSON.stringify(bestChild.move) + '\x1b[0m' +
            '_WR=' + Math.floor(bestChildWinRatio * 10000) / 100 + '%' +
            '_MS=' + (end - start) + ' ms' +
            '_NB=' + this.rootNode.visits);
        return bestChild.move;
    }
}
exports.default = MCTS;
const logger = new winston_1.Logger({
    transports: [],
});
//# sourceMappingURL=mcts.js.map