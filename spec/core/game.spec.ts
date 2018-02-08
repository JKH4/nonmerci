import BoardState from '../../src/core/board-state';
import Card from '../../src/core/card';
import Game, { GameAction, GameStatus, IGameOptions } from '../../src/core/game';

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
    expect(game.getBoardState()).toBeUndefined();
    expect(() => game.playNextTurn()).toThrowError('INVALID_GAME_STATUS');
    expect(game.getBoardState()).toBeUndefined();
  });

  it('Echoue à récupérer l\'état du plateau de jeu si la partie n\'est pas en cours:', () => {
    expect(game.getStatus()).toBe(GameStatus.Created);
    expect(game.getBoardState()).toBeUndefined();
    game.start();
    game.terminate();
    expect(game.getBoardState()).toBeUndefined();
  });

  it('Initialise la partie avec un tas de jetons vide:', () => {
    game.start();
    expect(game.getBoardState().getCurrentBoardState().deck.visibleCardTokens).toEqual(0);
  });

  it('Initialise la partie avec un tas de 23 cartes + une carte visible:', () => {
    game.start();
    expect(game.getBoardState().getCurrentBoardState().deck.deckSize).toEqual(23);
    expect(game.getBoardState().getCurrentBoardState().deck.visibleCard).toEqual(jasmine.any(Card));
  });

  it('Initialise la partie sans piles de cartes devant les joueurs:', () => {
    game.start();
    const boardstate = game.getBoardState().getCurrentBoardState();
    game.getPlayers().forEach((player) => {
      if (player === boardstate.activePlayer.name) {
        expect(boardstate.activePlayer.cards.length).toEqual(0);
      } else {
        expect(boardstate.otherPlayers.find((p) => p.name === player).cards.length).toEqual(0);
      }
    });
  });

  it('Initialise la partie en distribuant 11 jetons à chaque joueur:', () => {
    game.start();
    const firstPlayer = game.getBoardState().getCurrentBoardState().activePlayer.name;
    let boardstate = game.getBoardState().getCurrentBoardState();
    do {
      expect(boardstate.activePlayer.tokens).toEqual(11);
      game.playNextTurn();
      boardstate = game.getBoardState().getCurrentBoardState();
    } while (
      boardstate.activePlayer.name !== firstPlayer
    );
  });

  it('Initialise la partie avec le premier joueur en joueur actif:', () => {
    game.start();
    expect(game.getBoardState().getCurrentBoardState().activePlayer.name).toEqual(game.getPlayers()[0]);
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
    const turn = game.getBoardState().getCurrentBoardState().controlData.turn;
    expect(() => game.playNextTurn()).not.toThrowError();
    expect(game.getBoardState().getCurrentBoardState().controlData.turn).toEqual(turn + 1);
  });

  it('Choisi de payer en tant qu\'action du tour:', () => {
    const board = game.getBoardState();
    const player = board.getCurrentBoardState().activePlayer.name;
    const playerTokens = board.getCurrentBoardState().activePlayer.tokens;
    const tokenBag = board.getCurrentBoardState().deck.visibleCardTokens;
    const turn = board.getCurrentBoardState().controlData.turn;
    expect(() => game.playNextTurn(GameAction.Pay)).not.toThrowError();
    // expect(board.getCurrentBoardState().otherPlayers.find((p) => p.name === player).).toEqual(playerTokens - 1);
    expect(board.getCurrentBoardState().deck.visibleCardTokens).toEqual(tokenBag + 1);
    expect(board.getCurrentBoardState().controlData.turn).toEqual(turn + 1);
  });

  it('Transmet l\'erreur et laisse le plateau de jeu dans le même état si l\'action de payer échoue:', () => {
    const boardstate = game.getBoardState().getCurrentBoardState();

    const turn = boardstate.controlData.turn;
    const activePlayer = boardstate.activePlayer.name;
    const playerCardPiles = boardstate.activePlayer.cards;
    const playerTokens = boardstate.activePlayer.tokens;
    const card = boardstate.deck.visibleCard;
    const deck = boardstate.deck.deckSize;
    const tokenBag = boardstate.deck.visibleCardTokens;

    spyOn(game.getBoardState(), 'pay').and.callFake(() => { throw new Error('NOT_ENOUGH_TOKENS'); });
    expect(() => game.playNextTurn(GameAction.Pay)).toThrowError('NOT_ENOUGH_TOKENS');

    const newBoardstate = game.getBoardState().getCurrentBoardState();
    expect(newBoardstate.controlData.turn).toEqual(turn);
    expect(newBoardstate.activePlayer.name).toEqual(activePlayer);
    expect(newBoardstate.activePlayer.cards).toEqual(playerCardPiles);
    expect(newBoardstate.activePlayer.tokens).toEqual(playerTokens);
    expect(newBoardstate.deck.visibleCard).toEqual(card);
    expect(newBoardstate.deck.deckSize).toEqual(deck);
    expect(newBoardstate.deck.visibleCardTokens).toEqual(tokenBag);
  });

  it('Choisi de prendre en tant qu\'action du tour:', () => {
    game.playNextTurn(GameAction.Pay); // on ajoute quelque tour en Pay pour avoir des jetons au centre
    game.playNextTurn(GameAction.Pay);
    game.playNextTurn(GameAction.Pay);
    const board = game.getBoardState();
    const boardstate = game.getBoardState().getCurrentBoardState();

    const turn = boardstate.controlData.turn;
    const activePlayer = boardstate.activePlayer.name;
    const playerTokens = boardstate.activePlayer.tokens;
    const card = boardstate.deck.visibleCard;
    const deck = boardstate.deck.deckSize;
    const tokenBag = boardstate.deck.visibleCardTokens;
    expect(() => game.playNextTurn(GameAction.Take)).not.toThrowError();

    const newBoardstate = game.getBoardState().getCurrentBoardState();
    expect(newBoardstate.deck.visibleCardTokens).toEqual(0);
    expect(newBoardstate.activePlayer.name).toEqual(activePlayer);
    expect(newBoardstate.activePlayer.cards.indexOf(card)).toBeGreaterThan(-1);
    expect(newBoardstate.deck.deckSize).toEqual(deck - 1);
    expect(newBoardstate.controlData.turn).toEqual(turn + 1);
  });

  it('Récupére l\'état du plateau de jeu d\'une partie en cours:', () => {
    expect(game.getStatus()).toEqual(GameStatus.OnGoing);
    expect(game.getBoardState()).toEqual(jasmine.any(BoardState));
  });

  it('Passe au joueur suivant après un tour PAY si ce n\'était pas le dernier joueur:', () => {
    const playerList = game.getPlayers();
    const activePlayer = game.getBoardState().getCurrentBoardState().activePlayer.name;
    game.playNextTurn(GameAction.Pay);
    const nextActivePlayer = game.getBoardState().getCurrentBoardState().activePlayer.name;
    expect(playerList.indexOf(activePlayer) + 1).toEqual(playerList.indexOf(nextActivePlayer));
  });

  it('Revient au premier joueur après un tour PAY si c\'était le dernier joueur:', () => {
    const playerList = game.getPlayers();
    game.playNextTurn(GameAction.Pay);
    game.playNextTurn(GameAction.Pay);
    const activePlayer = game.getBoardState().getCurrentBoardState().activePlayer.name;
    expect(playerList.indexOf(activePlayer)).toEqual(playerList.length - 1);
    game.playNextTurn(GameAction.Pay);
    const nextActivePlayer = game.getBoardState().getCurrentBoardState().activePlayer.name;
    expect(playerList.indexOf(nextActivePlayer)).toEqual(0);
  });

  it('Reste sur le meme joueur actif après un tour TAKE:', () => {
    const playerList = game.getPlayers();
    const activePlayer = game.getBoardState().getCurrentBoardState().activePlayer.name;
    game.playNextTurn(GameAction.Take);
    expect(activePlayer).toEqual(game.getBoardState().getCurrentBoardState().activePlayer.name);
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
