import RandomSelection from './random-selection';

// import { IGame } from './mcts';

export class MctsGame {
  constructor() {
    // console.log('Constructor MctsGame');
  }
  public getPossibleMoves(): any[] | RandomSelection {
    // console.log('MctsGame getPossibleMoves()');
    return ['MctsGame1', 'MctsGame2'];
  }
  public getPossibleDraws(): any[] {
    // console.log('MctsGame getPossibleMoves()');
    return ['Draw1', 'Draw2', 'Draw3'];
  }
  public performMove(move: any): void {
    // console.log('MctsGame performMove()');
  }
  public performDraw(move: any): void {
    // console.log('MctsGame performMove()');
  }
  public getCurrentPlayer(): any {
    return 666;
  }
  public getWinner(): any {
    return 777;
  }
  // public isExpectiminimax(): boolean {
  //   return false;
  // }
  public isCurrentNodeADecisionNode(): boolean {
    return true;
  }
  public isNextNodeADecisionNode(nextAction: any): boolean {
    return true;
  }
}
