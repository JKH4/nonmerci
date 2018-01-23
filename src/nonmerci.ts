import Game from './game';

export default class NomMerci {
  constructor() {
    console.log('NomMerci constructor');
  }

  public createNewGame(): Game {
    console.log('createNewGame');
    return new Game();
  }
}
