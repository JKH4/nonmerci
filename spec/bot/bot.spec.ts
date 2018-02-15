import Bot, { BrainOptions } from '../../src/bot/bot';
import Board from '../../src/core/board';
import { GameAction } from '../../src/core/game';

describe('Gérer un Bot:', () => {
  it('Créé un bot avec une IA random', () => {
    const myBot = new Bot(BrainOptions.Random);
    expect(myBot).toEqual(jasmine.any(Bot));
    expect(myBot.getBotInfo().brainType).toEqual(BrainOptions.Random);
  });
  it('Propose une action de jeu en fonction d\'un état de plateau donné', () => {
    const myBot = new Bot(BrainOptions.Random);
    const board = new Board({players: ['Anna', 'Bob', 'Chris']});
    const boardstate = board.getPlayerState();
    const proposedAction = myBot.proposeAction(boardstate);
    expect(GameAction[proposedAction]).toEqual(proposedAction);
  });
  it('Propose une action aléatoire si le type d\'IA est random', () => {
    const myBot = new Bot(BrainOptions.Random);
    const board = new Board({players: ['Anna', 'Bob', 'Chris']});
    const boardstate = board.getPlayerState();
    let nbTake = 0;
    let nbPay = 0;
    const nbActions = 100;
    for (let i = 0; i < nbActions; i++) {
      myBot.proposeAction(boardstate) === GameAction.Take
        ? nbTake++
        : nbPay++;
    }
    expect(nbTake + nbPay).toEqual(nbActions);
    expect(nbTake).toBeGreaterThan(30);
    expect(nbPay).toBeGreaterThan(30);
  });
  it('Propose toujours une action TAKE si le type d\'IA est Take', () => {
    const myBot = new Bot(BrainOptions.Take);
    const board = new Board({players: ['Anna', 'Bob', 'Chris']});
    const boardstate = board.getPlayerState();
    let nbTake = 0;
    let nbPay = 0;
    const nbActions = 100;
    for (let i = 0; i < nbActions; i++) {
      myBot.proposeAction(boardstate) === GameAction.Take
        ? nbTake++
        : nbPay++;
    }
    expect(nbTake).toEqual(nbActions);
    expect(nbPay).toEqual(0);
  });
});
