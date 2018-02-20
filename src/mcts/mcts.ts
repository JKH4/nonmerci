import * as _ from 'lodash';

import Node from './node';
import RandomSelection from './random-selection';

import { MctsGame } from './mcts-game';

export default class MCTS {
  public game: MctsGame;
  public rounds: number;
  public player: any;
  public nodeSort: (node: Node) => number;
  public rootNode: Node;
  constructor(game: MctsGame, rounds?: number, player?: any) {
    const self = this;
    this.game = game;
    this.nodeSort = (node: Node) => {
      if (node.parent) {
        return node.getUCB1(node.parent.game.getCurrentPlayer());
      }
      return 0;
    };
    this.rounds = rounds || 1000; // 1000;
    this.player = player || 0;
    // console.log('JKH MCTS constructor 1');
    this.rootNode = new Node(game, null, null, 0, this, game.isNextNodeADecisionNode(null));
    // console.log('JKH MCTS constructor 2');
  }

  public selectMove() {
    const start = new Date().getTime();
    // console.log('JKH MCTS selectMove 1', this.game.getPossibleDraws().map((c) => c.getValues ? c.getValues() : c));
    // console.log('JKH MCTS selectMove 1', this.game.getPossibleMoves());
    let round;
    let currentNode;
    // console.log('jkh selectMove0', this.rootNode.move);
    for (round = 0; round < this.rounds && (new Date().getTime() - start < 30000); round += 1) {
      if (((round + 1) % 100) === 0) {
        process.stdout.write('!\r\n');
      } else {
        process.stdout.write('.');
      }
      currentNode = this.rootNode;
      // console.log('JKH MCTS selectMove 2 for', currentNode.move, currentNode.isDecisionNode);
      this.rootNode.visits += 1;
      // console.log('jkh selectMove', currentNode.move);
      while (!_.isEmpty(currentNode.getChildren())) {
        currentNode = currentNode.nextMove();
        currentNode.visits += 1;
      }
      // console.log('JKH MCTS selectMove 2 for 2');
      const winner = currentNode.getWinner();
      while (currentNode) {
        currentNode.wins[winner] = (currentNode.wins[winner] || 0) + 1;
        currentNode = currentNode.parent;
      }
    }
    process.stdout.write(new Date().getTime() - start + '\r\n');
    return _(this.rootNode.getChildren()).sortBy('visits').last().move;
  }
}

export interface IPlayerScore {
  [key: string]: number;
}

// export interface IGame {
//   getPossibleMoves(): any[] | RandomSelection;
//   performMove(move: any): void;
//   getCurrentPlayer(): any;
//   getWinner(): any;
// }

// exports.MCTS = MCTS
// exports.RandomSelection = RandomSelection
