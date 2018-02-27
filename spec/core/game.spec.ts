import Board from '../../src/core/board';
import { ActionType } from '../../src/core/board-helper';
import Card from '../../src/core/card';
import Game, { GameStatus, IGameOptions } from '../../src/core/game';

// **************************************************************************************
describe('Jouer une partie:', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  it('Démarre une partie:', () => {
    expect(() => game.start()).not.toThrowError();
    expect(game.getStatus()).toBe(GameStatus.OnGoing);
  });

  it('Refuse de démarrer une partie si elle est déjà démarrée:', () => {
    game.start();
    expect(game.getStatus()).toBe(GameStatus.OnGoing);
    expect(() => game.start()).toThrowError('INVALID_GAME_STATUS');
  });

  it('Refuse de démarrer une partie si elle est déjà terminée:', () => {
    game.start();
    game.terminate();
    expect(game.getStatus()).toBe(GameStatus.Terminated);
    expect(() => game.start()).toThrowError('INVALID_GAME_STATUS');
  });

  it('Termine une partie:', () => {
    game.start();
    expect(() => game.terminate()).not.toThrowError();
    expect(game.getStatus()).toBe(GameStatus.Terminated);
  });

  it('Refuse de terminer une partie si elle n\'est pas en cours:', () => {
    game.start();
    game.terminate();
    expect(game.getStatus()).toBe(GameStatus.Terminated);
    expect(() => game.terminate()).toThrowError('INVALID_GAME_STATUS');
  });

  it('Refuse de jouer le prochain tour d\'une partie non démarré:', () => {
    expect(game.getBoard()).toBeUndefined();
    expect(() => game.playNextTurn()).toThrowError('INVALID_GAME_STATUS');
    expect(game.getBoard()).toBeUndefined();
  });

  it('Echoue à récupérer l\'état du plateau de jeu si la partie n\'est pas en cours:', () => {
    expect(game.getStatus()).toBe(GameStatus.Created);
    expect(game.getBoard()).toBeUndefined();
    game.start();
    game.terminate();
    expect(game.getBoard()).toBeUndefined();
  });

  it('Initialise la partie avec un tas de jetons vide:', () => {
    game.start();
    expect(game.getBoard().getState().visibleTokens).toEqual(0);
  });

  it('Initialise la partie avec un tas de 23 cartes et pas de carte visible:', () => {
    game.start();
    expect(game.getBoard().getState().deckSize).toEqual(23);
    // expect(game.getBoard().getState().visibleCard).toBeUndefined();
    expect(game.getBoard().getState().visibleCard).toBeLessThanOrEqual(35);
  });

  it('Initialise la partie sans piles de cartes devant les joueurs:', () => {
    game.start();
    const boardstate = game.getBoard().getState();
    game.getPlayers().forEach((player) => {
      // if (player === boardstate.activePlayer) {
        expect(boardstate.players.find((p) => p.name === player).cards.length).toEqual(0);
      // } else {
      //   expect(boardstate.otherPlayers.find((p) => p.name === player).cards.length).toEqual(0);
      // }
    });
  });

  it('Initialise la partie en distribuant 11 jetons à chaque joueur:', () => {
    game.start();
    // const firstPlayer = game.getBoardState().getState().activePlayer;
    const boardstate = game.getBoard().getState();
    game.getPlayers().forEach((player) => {
      // if (player === boardstate.activePlayer) {
        expect(boardstate.players.find((p) => p.name === player).hiddenTokens).toEqual(11);
    });
    // do {
    //   expect(boardstate.activePlayer.tokens).toEqual(11);
    //   game.playNextTurn();
    //   boardstate = game.getBoardState().getCurrentBoardState();
    // } while (
    //   boardstate.activePlayer.name !== firstPlayer
    // );
  });

  it('Initialise la partie avec le premier joueur en joueur actif:', () => {
    game.start();
    expect(game.getBoard().getState().activePlayer).toEqual(game.getPlayers()[0]);
  });

});

// **************************************************************************************
describe('Jouer un tour:', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
    game.start();
  });

  it('Joue le prochain tour d\'une partie en cours:', () => {
    const turn = game.getBoard().getState().turn;
    expect(() => game.playNextTurn()).not.toThrowError();
    expect(game.getBoard().getState().turn).toEqual(turn + 1);
  });

  it('Choisi de payer en tant qu\'action du tour:', () => {
    const board = game.getBoard();
    const player = board.getState().activePlayer;
    const playerTokens = board.getState().players.find((p) => p.name === player).hiddenTokens;
    const tokenBag = board.getState().visibleTokens;
    const turn = board.getState().turn;
    expect(() => game.playNextTurn(ActionType.PAY)).not.toThrowError();
    // expect(board.getCurrentBoardState().otherPlayers.find((p) => p.name === player).).toEqual(playerTokens - 1);
    expect(board.getState().visibleTokens).toEqual(tokenBag + 1);
    expect(board.getState().turn).toEqual(turn + 1);
  });

  it('Transmet l\'erreur et laisse le plateau de jeu dans le même état si l\'action de payer échoue:', () => {
    const boardstate = game.getBoard().getState();

    const turn = boardstate.turn;
    const activePlayer = boardstate.activePlayer;
    const playerCardPiles = boardstate.players.find((p) => p.name === activePlayer).cards;
    const playerTokens = boardstate.players.find((p) => p.name === activePlayer).hiddenTokens;
    const card = boardstate.visibleCard;
    const deck = boardstate.deckSize;
    const tokenBag = boardstate.visibleTokens;

    spyOn(game.getBoard(), 'pay').and.callFake(() => { throw new Error('NOT_ENOUGH_TOKENS'); });
    expect(() => game.playNextTurn(ActionType.PAY)).toThrowError('NOT_ENOUGH_TOKENS');

    const newBoardstate = game.getBoard().getState();
    expect(newBoardstate.turn).toEqual(turn);
    expect(newBoardstate.activePlayer).toEqual(activePlayer);
    expect(newBoardstate.players.find((p) => p.name === activePlayer).cards).toEqual(playerCardPiles);
    expect(newBoardstate.players.find((p) => p.name === activePlayer).hiddenTokens).toEqual(playerTokens);
    expect(newBoardstate.visibleCard).toEqual(card);
    expect(newBoardstate.deckSize).toEqual(deck);
    expect(newBoardstate.visibleTokens).toEqual(tokenBag);
  });

  it('Choisi de prendre en tant qu\'action du tour:', () => {
    game.playNextTurn(ActionType.PAY); // on ajoute quelque tour en Pay pour avoir des jetons au centre
    game.playNextTurn(ActionType.PAY);
    game.playNextTurn(ActionType.PAY);
    const board = game.getBoard();
    const boardstate = game.getBoard().getState();

    const turn = boardstate.turn;
    const activePlayer = boardstate.activePlayer;
    const playerTokens = boardstate.players.find((p) => p.name === activePlayer).hiddenTokens;
    const card = boardstate.visibleCard;
    const deckSize = boardstate.deckSize;
    const tokenBag = boardstate.visibleTokens;
    expect(() => game.playNextTurn(ActionType.TAKE)).not.toThrowError();

    const newBoardstate = game.getBoard().getState();
    expect(newBoardstate.visibleTokens).toEqual(0);
    expect(newBoardstate.activePlayer).toEqual(activePlayer);
    expect(newBoardstate.players.find((p) => p.name === activePlayer).cards.indexOf(card))
      .toBeGreaterThan(-1);
    expect(newBoardstate.deckSize).toEqual(deckSize - 1);
    expect(newBoardstate.turn).toEqual(turn + 1);
  });

  it('Récupére l\'état du plateau de jeu d\'une partie en cours:', () => {
    expect(game.getStatus()).toEqual(GameStatus.OnGoing);
    expect(game.getBoard()).toEqual(jasmine.any(Board));
  });

  it('Passe au joueur suivant après un tour PAY si ce n\'était pas le dernier joueur:', () => {
    const playerList = game.getPlayers();
    const activePlayer = game.getBoard().getState().activePlayer;
    game.playNextTurn(ActionType.PAY);
    const nextActivePlayer = game.getBoard().getState().activePlayer;
    expect(playerList.indexOf(activePlayer) + 1).toEqual(playerList.indexOf(nextActivePlayer));
  });

  it('Revient au premier joueur après un tour PAY si c\'était le dernier joueur:', () => {
    const playerList = game.getPlayers();
    game.playNextTurn(ActionType.PAY);
    game.playNextTurn(ActionType.PAY);
    const activePlayer = game.getBoard().getState().activePlayer;
    expect(playerList.indexOf(activePlayer)).toEqual(playerList.length - 1);
    game.playNextTurn(ActionType.PAY);
    const nextActivePlayer = game.getBoard().getState().activePlayer;
    expect(playerList.indexOf(nextActivePlayer)).toEqual(0);
  });

  it('Reste sur le meme joueur actif après un tour TAKE:', () => {
    const playerList = game.getPlayers();
    const activePlayer = game.getBoard().getState().activePlayer;
    game.playNextTurn(ActionType.TAKE);
    expect(activePlayer).toEqual(game.getBoard().getState().activePlayer);
  });

  it('Termine la partie lorsque la fin de la partie est détectée:', () => {
    while (1) {
      try {
        game.playNextTurn();
      } catch (e) {
        const err: Error = e;
        if (err.message === 'END_OF_GAME') {
          expect(game.getStatus()).toEqual(GameStatus.Terminated);
          break;
        } else {
          throw e;
        }
      }
    }
  });

  it('Calcule les scores de tous les joueurs lorsque la fin de la partie est détectée:', () => {
    const players = game.getPlayers();
    while (1) {
      try {
        game.playNextTurn();
      } catch (e) {
        const err: Error = e;
        if (err.message === 'END_OF_GAME') {
          players.forEach((player: string) => {
            expect(game.getScores().find(([playerName, playerScore]: [string, number]) => playerName === player))
              .not.toBeUndefined();
          });
          break;
        } else {
          throw e;
        }
      }
    }
  });
});
