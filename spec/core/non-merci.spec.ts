import jasmineModule from 'jasmine';

import NonMerci from '../../src/core/non-merci';

import Game, { GameAction, GameStatus, IGameOptions } from '../../src/core/game';

// **************************************************************************************
describe('Gérer une partie:', () => {
  let nm: NonMerci;

  beforeEach(() => {
    nm = new NonMerci();
  });

  it('Crée une nouvelle partie de NonMerci:', () => {
    const game = nm.createNewGame();
    expect(game).toEqual(jasmine.any(Game));
    expect(game.getStatus()).toEqual(GameStatus.Created);
    expect(game.getPlayers().length).toBe(3);
    expect(game.getPlayers()).toEqual(['Joueur1', 'Joueur2', 'Joueur3']);
  });

  it('Crée une nouvelle partie de NonMerci avec 3 joueur:', () => {
    const gameOptions: IGameOptions = {
      players: ['Anna', 'Bob', 'Chris'],
    };
    const game = nm.createNewGame(gameOptions);
    expect(game.getPlayers().length).toBe(3);
    expect(game.getPlayers()).toEqual(['Anna', 'Bob', 'Chris']);
  });

  it('Crée une nouvelle partie de NonMerci avec 5 joueurs:', () => {
    const gameOptions: IGameOptions = {
      players: ['Anna', 'Bob', 'Chris', 'David', 'Ed'],
    };
    const game = nm.createNewGame(gameOptions);
    expect(game.getPlayers().length).toBe(5);
    expect(game.getPlayers()).toEqual(['Anna', 'Bob', 'Chris', 'David', 'Ed']);
  });

  it('Refuse de créer une nouvelle partie de NonMerci avec seulement 2 joueurs:', () => {
    const gameOptions: IGameOptions = {
      players: ['Anna', 'Bob'],
    };
    let failedNewGame;
    expect(() => failedNewGame = nm.createNewGame(gameOptions)).toThrowError('INVALID_NUMBER_OF_PLAYERS');
    expect(failedNewGame).toBeUndefined();
  });

  it('Refuse de créer une nouvelle partie de NonMerci avec 6 joueurs:', () => {
    const gameOptions: IGameOptions = {
      players: ['Anna', 'Bob', 'Chris', 'David', 'Ed', 'Franc'],
    };
    let failedNewGame;
    expect(() => failedNewGame = nm.createNewGame(gameOptions)).toThrowError('INVALID_NUMBER_OF_PLAYERS');
    expect(failedNewGame).toBeUndefined();
  });

});
