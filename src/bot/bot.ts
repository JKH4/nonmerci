import { ICurrentBoardState } from '../core/board-state';
import { GameAction } from '../core/game';

export default class Bot {
  private brainType: BrainOptions;
  constructor(brainType?: BrainOptions) {
    switch (brainType) {
      case BrainOptions.Random:
        this.brainType = BrainOptions.Random;
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

  public proposeAction = (boardstate: ICurrentBoardState): GameAction => {
    switch (this.brainType) {
      case BrainOptions.Random:
        return this.proposeActionRandom();
      case BrainOptions.Take:
        return GameAction.Take;
      default:
        throw new Error('INVALID_BRAIN_TYPE');
    }
  }

  private proposeActionRandom = () => Math.floor(Math.random () * 2) ? GameAction.Take : GameAction.Pay;
}

export enum BrainOptions {
  Random = 'Random',
  Take = 'Take',
}
