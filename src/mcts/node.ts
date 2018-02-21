import * as _ from 'lodash';

import MCTS, { IPlayerScore } from './mcts';
import RandomSelection from './random-selection';

import { MctsGame } from './mcts-game';

export default class Node {
  public game: MctsGame;
  public mcts: MCTS;
  public parent?: Node;
  public move: any;
  public wins: IPlayerScore;
  public visits: number;
  public children?: Node[];
  public depth: number;
  public randomNode: boolean;
  public gameConstructor: any;
  constructor(game: MctsGame, parent: Node | null, move: any, depth: number, mcts: MCTS) {
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

  public getUCB1(player: any) {
    let scorePerVisit: number = 0;
    // always visit unvisited nodes first
    if (this.visits === 0) { return Infinity; }
    if (!this.parent) {
      return 0;
    }
    scorePerVisit = (this.wins[player] || 0) / this.visits;
    // See https://en.wikipedia.org/wiki/Monte_Carlo_tree_search#Exploration_and_exploitation
    return scorePerVisit + Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
  }

  public getChildren() {
    if (this.children === null) {
      if (this.move !== null) {
        this.game.performMove(this.move);
      }
      let moves: any;
      moves = this.game.getPossibleMoves();
      if (moves instanceof RandomSelection) {
        moves = moves.array;
        this.randomNode = true;
      }
      this.children = _.map(moves, (move: any) => {
        return new Node(
          _.assign(
            new this.gameConstructor(),
            _.cloneDeep(this.game),
          ),
          this,
          move,
          this.depth + 1,
          this.mcts,
        );
      });
    }
    return this.children;
  }

  public getWinner() {
    // forces the move to be performed
    this.getChildren();
    return this.game.getWinner();
  }

  public nextMove() {
    // shuffle because sortBy is a stable sort but we want equal nodes to be chosen randomly
    if (this.randomNode) {
      return _(this.getChildren()).shuffle().last();
    }
    return _(this.getChildren()).shuffle().sortBy(this.mcts.nodeSort).last();
  }
}
