import any from 'jasmine';
import jasmine from 'jasmine';

import Game from '../../src/game';
import NonMerci from '../../src/nonmerci';

describe('Gérer une partie', () => {
  let nm: NonMerci;

  beforeEach(() => {
    nm = new NonMerci();
  });

  it('Crée une nouvelle partie de NonMerci', () => {
    const newGame = nm.createNewGame();
    // console.log(instanceof newGame);
    expect(newGame instanceof Game).toEqual(true);
    expect(newGame instanceof NonMerci).toEqual(false);
  });
});
