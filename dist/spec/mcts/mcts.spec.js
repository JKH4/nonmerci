"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcts_1 = require("./../../src/mcts/mcts");
const random_selection_1 = require("./../../src/mcts/random-selection");
const game_examples_1 = require("./game-examples");
describe('mcts', () => {
    it('should return one option when only one is returned for a state', () => {
        const mcts = new mcts_1.default(new game_examples_1.SingleCellGame());
        expect(mcts.selectMove()).toEqual(0);
        // assert.deepEqual(mcts.selectMove(), 0);
    });
    it('should always select the winning option when there are two options', () => {
        const mcts = new mcts_1.default(new game_examples_1.TwoCellGame());
        expect(mcts.selectMove()).toEqual(1);
        // assert.equal(mcts.selectMove(), 1);
    });
    it('should favor the winning move in a game of Tic Tac Toe', () => {
        const tictactoegame = new game_examples_1.TicTacToeGame();
        const mcts = new mcts_1.default(tictactoegame, 1000, 'X');
        tictactoegame.board = [['O', 'O', null],
            ['X', 'X', null],
            ['O', 'O', null]];
        expect(mcts.selectMove()).toEqual([1, 2]);
        // assert.deepEqual(mcts.selectMove(), [1, 2]);
    });
    it('should block the winning move in a game of Tic Tac Toe', () => {
        const tictactoegame = new game_examples_1.TicTacToeGame();
        const mcts = new mcts_1.default(tictactoegame, 1000, 'X');
        tictactoegame.board = [[null, null, 'O'],
            [null, 'O', null],
            [null, null, null]];
        expect(mcts.selectMove()).toEqual([2, 0]);
        // assert.deepEqual(mcts.selectMove(), [2, 0]);
    });
    it('should randomly select moves instead of consulting the UCB for RandomSelection moves', () => {
        const summingdicegame = new game_examples_1.SummingDiceGame();
        const mcts = new mcts_1.default(summingdicegame, 100, 1);
        expect(mcts.selectMove()).toEqual(2);
        // assert.equal(mcts.selectMove(), 2);
        const rootNode = mcts.rootNode;
        const children = rootNode ? rootNode.getChildren() : null;
        if (children) {
            expect(children[0].randomNode).toEqual(true);
            // assert.equal(children[0].randomNode, true);
        }
        else {
            throw new Error('rootNode undefined');
        }
    });
});
describe('RandomElement', () => {
    it('should initialize an array based on its first parameter', () => {
        const rs = new random_selection_1.default([0, 1, 2, 3]);
        expect(rs.array).toEqual([0, 1, 2, 3]);
        // assert.deepEqual(rs.array, [0, 1, 2, 3]);
    });
});
//# sourceMappingURL=mcts.spec.js.map