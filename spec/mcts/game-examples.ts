
import RandomSelection from './../../src/mcts/random-selection';

import { MctsGame } from './../../src/mcts/mcts-game';

export class SingleCellGame extends MctsGame {
  public board?: number[];
  public currentPlayer: number;
  constructor() {
    // console.log('SingleCellGame Constructor');
    super();
    // First player to play always wins
    this.board = [null];
    this.currentPlayer = 0;
  }
  public getPossibleMoves() {
    // console.log('SingleCellGame getPossibleMoves()');
    if (this.board[0] === null) {
      return [0];
    }
    return [];
  }

  public performMove(move: number) {
    // console.log('SingleCellGame performMove()');
    this.board[move] = 0;
  }

  public getCurrentPlayer() {
    return 0;
  }

  public getWinner() {
    return this.board[0];
  }
}

// tslint:disable-next-line:max-classes-per-file
export class TwoCellGame extends MctsGame {
  public board?: number[];
  public currentPlayer: number;
  constructor() {
    super();
    // Player that plays in the 2nd cell always wins
    this.board = [null, null];
    this.currentPlayer = 0;
  }

  public getPossibleMoves() {
    let i;
    const available = [];
    for (i = 0; i < 2; i += 1) {
      if (this.board[i] === null) {
        available.push(i);
      }
    }
    return available;
  }

  public performMove(move: number) {
    this.board[move] = this.currentPlayer;
    this.currentPlayer += 1;
    this.currentPlayer = this.currentPlayer % 2;
  }

  public getCurrentPlayer() {
    return this.currentPlayer;
  }

  public getWinner() {
    return this.board[1];
  }
}

type TicTacToePlayer =
| 'X'
| 'O';

// tslint:disable-next-line:max-classes-per-file
export class TicTacToeGame {
  public board?: TicTacToePlayer[][];
  public boardScore: number[][];
  public winningScores: number[];
  public currentPlayer: TicTacToePlayer;
  constructor() {
    this.board = [[null, null, null],
                  [null, null, null],
                  [null, null, null]];
    // See http://jsfiddle.net/5wKfF/249/
    this.boardScore = [[1, 2, 4],
                       [8, 16, 32],
                       [64, 128, 256]];
    this.winningScores = [7, 56, 448, 73, 146, 292, 273, 84];
    this.currentPlayer = 'X';
  }

  public getPossibleMoves() {
    // console.log('TicTacToeGame getPossibleMoves()');
    let y;
    let x;
    const available = [];
    if (this.getWinner() !== null) {
      return [];
    }
    for (y = 0; y < 3; y += 1) {
      for (x = 0; x < 3; x += 1) {
        if (this.board[y][x] === null) {
          available.push([y, x]);
        }
      }
    }
    return available;
  }

  public performMove(move: number[]) {
    this.board[move[0]][move[1]] = this.currentPlayer;
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
  }

  public getCurrentPlayer() {
    return this.currentPlayer;
  }

  public getWinner() {
    let player;
    const playerScores: { [key: string]: number} = {X: 0, O: 0};
    for (let y = 0; y < 3; y += 1) {
      for (let x = 0; x < 3; x += 1) {
        if (this.board[y][x] != null) {
          playerScores[this.board[y][x]] += this.boardScore[y][x];
        }
      }
    }
    for (let p = 0; p < 2; p += 1) {
      player = ['X', 'O'][p];
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < this.winningScores.length; i += 1) {
        // tslint:disable-next-line:no-bitwise
        if ((this.winningScores[i] & playerScores[player]) === this.winningScores[i]) {
          return player;
        }
      }
    }
    return null;
  }
}

// tslint:disable-next-line:max-classes-per-file
export class SummingDiceGame extends MctsGame {
  public currentPlayer: number;
  public round: number;
  public score: number;
  public diceToRoll: number;
  constructor() {
    super();
    this.currentPlayer = 1;
    this.round = 0;
    this.score = 0;
  }

  public getPossibleMoves() {
    switch (this.round) {
      case 0:
        return [0, 1, 2];
      case 1:
        if (this.diceToRoll === 0) {
          return new RandomSelection([]);
        }
        if (this.diceToRoll === 1) {
          return new RandomSelection([1, 2, 3, 4, 5, 6]);
        }
        return new RandomSelection([2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7,
                                    7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 9, 9, 9, 9, 10,
                                    10, 10, 11, 11, 12]);
    }
    return [];
  }

  public getCurrentPlayer() {
    return 1;
  }

  public performMove(move: number) {
    switch (this.round) {
      case 0:
        this.diceToRoll = move;
        break;
      case 1:
        this.score += move;
        break;
    }
    this.round += 1;
  }

  public getWinner() {
    if (this.score > 5) {
      return 1;
    }
  }
}

// exports.SingleCellGame = SingleCellGame;
// exports.TwoCellGame = TwoCellGame;
// exports.TicTacToeGame = TicTacToeGame;
// exports.SummingDiceGame = SummingDiceGame;
