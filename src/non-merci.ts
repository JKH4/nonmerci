import Game, { IGameOptions } from './game';

export default class NomMerci {
  constructor() {
    // console.log('NomMerci constructor');
  }

  public createNewGame(options?: IGameOptions): Game {
    return new Game(options);
  }
}
