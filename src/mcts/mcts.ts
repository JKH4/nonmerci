import * as _ from 'lodash';

import Node from './node';
import RandomSelection from './random-selection';

import { MctsGame } from './mcts-game';

export default class MCTS {
  public game: any;
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
    this.rounds = rounds || 1000;
    this.player = player || 0;
    this.rootNode = new Node(game, null, null, 0, this);
  }

  public selectMove() {
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