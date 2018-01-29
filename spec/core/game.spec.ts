import BoardState from '../../src/board-state';
import Card from '../../src/card';
import Game, { GameAction, GameStatus, IGameOptions } from '../../src/game';

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
    expect(game.getCurrentTurn()).toBeUndefined();
    expect(() => game.playNextTurn()).toThrowError('INVALID_GAME_STATUS');
    expect(game.getCurrentTurn()).toBeUndefined();
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
    expect(game.getBoardState().getCurrentTokenBagSize()).toEqual(0);
  });

  it('Initialise la partie avec un tas de 23 cartes + une carte visible:', () => {
    game.start();
    expect(game.getBoardState().getCurrentDeckSize()).toEqual(23);
    expect(game.getBoardState().getCurrentCard()).toEqual(jasmine.any(Card));
  });

  it('Initialise la partie sans piles de cartes devant les joueurs:', () => {
    game.start();
    game.getPlayers().forEach((player) => {
      expect(game.getBoardState().getCurrentPlayerCardPiles(player).length).toEqual(0);
    });
  });

  it('Initialise la partie en distribuant 11 jetons à chaque joueur:', () => {
    game.start();
    game.getPlayers().forEach((player) => {
      expect(game.getBoardState().getCurrentPlayerTokenPile(player)).toEqual(11);
    });
  });

  it('Initialise la partie avec le premier joueur en joueur actif:', () => {
    game.start();
    expect(game.getBoardState().getActivePlayer()).toEqual(game.getPlayers()[0]);
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
    const turn = game.getCurrentTurn();
    expect(() => game.playNextTurn()).not.toThrowError();
    expect(game.getCurrentTurn()).toEqual(turn + 1);
  });

  it('Choisi de payer en tant qu\'action du tour:', () => {
    const board = game.getBoardState();
    const player = board.getActivePlayer();
    const playerTokens = board.getCurrentPlayerTokenPile(player);
    const tokenBag = board.getCurrentTokenBagSize();
    const turn = game.getCurrentTurn();
    expect(() => game.playNextTurn(GameAction.Pay)).not.toThrowError();
    expect(board.getCurrentPlayerTokenPile(player)).toEqual(playerTokens - 1);
    expect(board.getCurrentTokenBagSize()).toEqual(tokenBag + 1);
    expect(game.getCurrentTurn()).toEqual(turn + 1);
  });

  it('Transmet l\'erreur et laisse le plateau de jeu dans le même état si l\'action de payer échoue:', () => {
    const board = game.getBoardState();

    const turn = game.getCurrentTurn();
    const activePlayer = board.getActivePlayer();
    const card = board.getCurrentCard();
    const deck = board.getCurrentDeckSize();
    const tokenBag = board.getCurrentTokenBagSize();
    const playerCardPiles = board.getCurrentPlayerCardPiles(activePlayer);
    const playerTokens = board.getCurrentPlayerTokenPile(activePlayer);

    spyOn(board, 'pay').and.callFake(() => { throw new Error('NOT_ENOUGH_TOKENS'); });

    expect(() => game.playNextTurn(GameAction.Pay)).toThrowError('NOT_ENOUGH_TOKENS');
    expect(game.getCurrentTurn()).toEqual(turn);
    expect(board.getActivePlayer()).toEqual(activePlayer);
    expect(board.getCurrentCard()).toEqual(card);
    expect(board.getCurrentDeckSize()).toEqual(deck);
    expect(board.getCurrentTokenBagSize()).toEqual(tokenBag);
    expect(board.getCurrentPlayerCardPiles(activePlayer)).toEqual(playerCardPiles);
    expect(board.getCurrentPlayerTokenPile(activePlayer)).toEqual(playerTokens);
  });

  it('Choisi de prendre en tant qu\'action du tour:', () => {
    game.playNextTurn(GameAction.Pay); // on ajoute quelque tour en Pay pour avoir des jetons au centre
    game.playNextTurn(GameAction.Pay);
    game.playNextTurn(GameAction.Pay);
    const board = game.getBoardState();
    const player = board.getActivePlayer();
    const playerTokens = board.getCurrentPlayerTokenPile(player);
    const tokenBag = board.getCurrentTokenBagSize();
    const card = board.getCurrentCard();
    const deckSize = board.getCurrentDeckSize();
    const turn = game.getCurrentTurn();
    expect(() => game.playNextTurn(GameAction.Take)).not.toThrowError();
    expect(board.getCurrentPlayerTokenPile(player)).toEqual(playerTokens + tokenBag);
    expect(board.getCurrentTokenBagSize()).toEqual(0);
    expect(board.getCurrentPlayerCardPiles(player).indexOf(card)).toBeGreaterThan(-1);
    expect(board.getCurrentDeckSize()).toEqual(deckSize - 1);
    expect(game.getCurrentTurn()).toEqual(turn + 1);
  });

  it('Récupére l\'état du plateau de jeu d\'une partie en cours:', () => {
    expect(game.getStatus()).toEqual(GameStatus.OnGoing);
    expect(game.getBoardState()).toEqual(jasmine.any(BoardState));
  });

  it('Consulte la carte visible sur le plateau de jeu:', () => {
    const currentCard = game.getBoardState().getCurrentCard();
    expect(currentCard).toEqual(jasmine.any(Card));
    expect(typeof currentCard.getValue()).toBe('number');
  });

  it('Consulte la taille du tas de carte du plateau de jeu:', () => {
    expect(typeof game.getBoardState().getCurrentDeckSize()).toBe('number');
  });

  it('Consulte la taille du tas de jeton du plateau de jeu:', () => {
    expect(typeof game.getBoardState().getCurrentTokenBagSize()).toBe('number');
  });

  it('Conserve le nombre de jeton à 11 x nb joueur en jeu après un tour:', () => {
    const board = game.getBoardState();

    const initTotalTokens = board.getCurrentTokenBagSize() + game.getPlayers()
      .map((player) => board.getCurrentPlayerTokenPile(player))
      .reduce((total, current) => total + current, 0);

    expect(initTotalTokens).toEqual(game.getPlayers().length * 11);

    game.playNextTurn();
    const newTotalTokens = board.getCurrentTokenBagSize() + game.getPlayers()
      .map((player) => board.getCurrentPlayerTokenPile(player))
      .reduce((total, current) => total + current, 0);

    expect(initTotalTokens).toEqual(newTotalTokens);
  });

  it('Passe au joueur suivant dans la liste des joueurs après un tour si ce n\'était pas le dernier joueur:', () => {
    const playerList = game.getPlayers();
    const activePlayer = game.getBoardState().getActivePlayer();
    game.playNextTurn();
    const nextActivePlayer = game.getBoardState().getActivePlayer();
    expect(playerList.indexOf(activePlayer) + 1).toEqual(playerList.indexOf(nextActivePlayer));
  });

  it('Revient au premier joueur dans la liste des joueurs après un tour si c\'était le dernier joueur:', () => {
    const playerList = game.getPlayers();
    game.playNextTurn();
    game.playNextTurn();
    const activePlayer = game.getBoardState().getActivePlayer();
    expect(playerList.indexOf(activePlayer)).toEqual(playerList.length - 1);
    game.playNextTurn();
    const nextActivePlayer = game.getBoardState().getActivePlayer();
    expect(playerList.indexOf(nextActivePlayer)).toEqual(0);
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
          console.log(game.getScores());
          break;
        } else {
          throw e;
        }
      }
    }
  });
});
