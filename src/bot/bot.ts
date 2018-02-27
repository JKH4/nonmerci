import Board from '../core/board';
// import { GameAction } from '../core/game';
import { ActionType, IDraw, IGameAction } from '../core/board-helper';

import MCTS from '../mcts/mcts';

export default class Bot {
  private brainType: BrainOptions;
  constructor(brainType?: BrainOptions) {
    switch (brainType) {
      case BrainOptions.Random:
        this.brainType = BrainOptions.Random;
        break;
      case BrainOptions.Mcts1:
        this.brainType = BrainOptions.Mcts1;
        break;
      case BrainOptions.Take:
        this.brainType = BrainOptions.Take;
        break;
      case undefined:
        this.brainType = BrainOptions.Random;
        break;
      default:
        throw new Error('INVALID_BRAIN_TYPE');
    }
  }

  public getBotInfo = () => ({ brainType: this.brainType });

  public proposeAction = (board: Board): IDraw | IGameAction => {
    switch (this.brainType) {
      case BrainOptions.Random:
        return this.proposeActionRandom();
      case BrainOptions.Mcts1:
        const mcts = new MCTS(board);
        // console.log('juste avant selectMove');
        const move = mcts.selectMove();
        // console.log('proposeAction', move);
        return move;
      case BrainOptions.Take:
        return { type: ActionType.TAKE };
        // return GameAction.Take;
      default:
        throw new Error('INVALID_BRAIN_TYPE');
    }
  }

  private proposeActionRandom = (): IGameAction => Math.floor(Math.random () * 2)
    ? {type: ActionType.TAKE}
    : {type: ActionType.PAY}
}

export enum BrainOptions {
  Random = 'Random',
  Take = 'Take',
  Mcts1 = 'Mcts1',
}
