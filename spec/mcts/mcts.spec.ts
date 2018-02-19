import * as _ from 'lodash';

import MCTS, { IPlayerScore } from './../../src/mcts/mcts';
import RandomSelection from './../../src/mcts/random-selection';

import { SingleCellGame, SummingDiceGame, TicTacToeGame, TwoCellGame } from './game-examples';

describe('mcts', () => {
  it('should return one option when only one is returned for a state', () => {
    console.log('JKH');
    const mcts = new MCTS(new SingleCellGame());
    expect(mcts.selectMove()).toEqual(0);
    // assert.deepEqual(mcts.selectMove(), 0);
  });
  it('should always select the winning option when there are two options', () => {
    const mcts = new MCTS(new TwoCellGame());
    expect(mcts.selectMove()).toEqual(1);
    // assert.equal(mcts.selectMove(), 1);
  });
  it('should favor the winning move in a game of Tic Tac Toe', () => {
    const tictactoegame = new TicTacToeGame();
    const mcts = new MCTS(tictactoegame, 1000, 'X');
    tictactoegame.board = [['O', 'O', null],
                           ['X', 'X', null],
                           ['O', 'O', null]];
    expect(mcts.selectMove()).toEqual([1, 2]);
    // assert.deepEqual(mcts.selectMove(), [1, 2]);
  });
  it('should block the winning move in a game of Tic Tac Toe', () => {
    const tictactoegame = new TicTacToeGame();
    const mcts = new MCTS(tictactoegame, 1000, 'X');
    tictactoegame.board = [[null, null, 'O'],
                           [null, 'O', null],
                           [null, null, null]];
    expect(mcts.selectMove()).toEqual([2, 0]);
    // assert.deepEqual(mcts.selectMove(), [2, 0]);
  });
  it('should randomly select moves instead of consulting the UCB for RandomSelection moves', () => {
    const summingdicegame = new SummingDiceGame();
    const mcts = new MCTS(summingdicegame, 100, 1);
    expect(mcts.selectMove()).toEqual( 2);
    // assert.equal(mcts.selectMove(), 2);
    const rootNode = mcts.rootNode;
    const children = rootNode ? rootNode.getChildren() : null;
    if (children) {
      expect(children[0].randomNode).toEqual(true);
      // assert.equal(children[0].randomNode, true);
    } else {
      throw new Error('rootNode undefined');
    }
  });
});

describe('RandomElement', () => {
  it('should initialize an array based on its first parameter', () => {
    const rs = new RandomSelection([0, 1, 2, 3]);
    expect(rs.array).toEqual([0, 1, 2, 3]);
    // assert.deepEqual(rs.array, [0, 1, 2, 3]);
  });
});
