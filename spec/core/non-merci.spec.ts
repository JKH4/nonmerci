import jasmineModule from 'jasmine';

import NonMerci from '../../src/non-merci';

import BoardState from '../../src/board-state';
import Card from '../../src/card';
import Game, { GameAction, GameStatus, IGameOptions } from '../../src/game';

// **************************************************************************************
describe('Gérer une partie:', () => {
  let nm: NonMerci;

  beforeEach(() => {
    nm = new NonMerci();
  });

  it('Crée une nouvelle partie de NonMerci:', () => {
    const game = nm.createNewGame();
    expect(game instanceof Game).toBeTruthy();
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

// **************************************************************************************
describe('Jouer une partie:', () => {
  let game: Game;

  beforeEach(() => {
    game = new NonMerci().createNewGame();
  });

  it('Démarre une partie:', () => {
    expect(game.start()).toBeTruthy();
    expect(game.getStatus()).toBe(GameStatus.OnGoing);
  });

  it('Refuse de démarrer une partie si elle est déjà démarrée:', () => {
    game.start();
    expect(game.getStatus()).toBe(GameStatus.OnGoing);
    expect(game.start()).toBeFalsy();
  });

  it('Refuse de démarrer une partie si elle est déjà terminée:', () => {
    game.start();
    game.terminate();
    expect(game.getStatus()).toBe(GameStatus.Terminated);
    expect(game.start()).toBeFalsy();
  });

  it('Termine une partie:', () => {
    game.start();
    expect(game.terminate()).toBeTruthy();
    expect(game.getStatus()).toBe(GameStatus.Terminated);
  });

  it('Refuse de terminer une partie si elle n\'est pas en cours:', () => {
    expect(game.getStatus()).toBe(GameStatus.Created);
    expect(game.terminate()).toBeFalsy();
    game.start();
    game.terminate();
    expect(game.getStatus()).toBe(GameStatus.Terminated);
    expect(game.terminate()).toBeFalsy();
  });

  it('Refuse de jouer le prochain tour d\'une partie non démarré:', () => {
    expect(game.getCurrentTurn()).toBeUndefined();
    expect(game.playNextTurn()).toBeFalsy();
    expect(game.getCurrentTurn()).toBeUndefined();
  });

  it('Echoue à récupérer l\'état du plateau de jeu si la partie n\'est pas en cours:', () => {
    expect(game.getStatus()).toBe(GameStatus.Created);
    expect(game.getBoardState() instanceof BoardState).toBeFalsy();
    game.start();
    game.terminate();
    expect(game.getBoardState() instanceof BoardState).toBeFalsy();
  });

  it('Initialise la partie avec un tas de jetons vide:', () => {
    game.start();
    expect(game.getBoardState().getCurrentTokenBagSize()).toEqual(0);
  });

  it('Initialise la partie avec un tas de 23 cartes + une carte visible:', () => {
    game.start();
    expect(game.getBoardState().getCurrentDeckSize()).toEqual(23);
    expect(game.getBoardState().getCurrentCard() instanceof Card).toBeTruthy();
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
    game = new NonMerci().createNewGame();
    game.start();
  });

  it('Joue le prochain tour d\'une partie en cours:', () => {
    const turn = game.getCurrentTurn();
    expect(game.playNextTurn()).toBeTruthy();
    expect(game.getCurrentTurn()).toEqual(turn + 1);
  });

  it('Choisi de payer en tant qu\'action du tour:', () => {
    const board = game.getBoardState();
    const player = board.getActivePlayer();
    const playerTokens = board.getCurrentPlayerTokenPile(player);
    const tokenBag = board.getCurrentTokenBagSize();
    const turn = game.getCurrentTurn();
    expect(game.playNextTurn(GameAction.Pay)).toBeTruthy();
    expect(board.getCurrentPlayerTokenPile(player)).toEqual(playerTokens - 1);
    expect(board.getCurrentTokenBagSize()).toEqual(tokenBag + 1);
    expect(game.getCurrentTurn()).toEqual(turn + 1);
  });

  it('Echoue à payer en tant qu\'action du tour si le joueur actif n\'a pas de jeton:', (done) => {
    const board = game.getBoardState();
    for (let i = 0; i < 100; i++) {
      console.log(board.getActivePlayer() + '=' + board.getCurrentPlayerTokenPile(board.getActivePlayer()));
      // console.log(board.getCurrentPlayerTokenPile(board.getActivePlayer()));
      if (board.getCurrentPlayerTokenPile(board.getActivePlayer()) === 0) {
        console.log('HAAAAAAAAAAAAAAAAA');
        expect(() => board.pay()).toThrowError('NOT_ENOUGH_TOKENS');
        break;
      } else {
        board.pay();
      }
      done();
    }
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
    expect(game.playNextTurn(GameAction.Take)).toBeTruthy();
    expect(board.getCurrentPlayerTokenPile(player)).toEqual(playerTokens + tokenBag);
    expect(board.getCurrentTokenBagSize()).toEqual(0);
    expect(board.getCurrentPlayerCardPiles(player).indexOf(card)).toBeGreaterThan(-1);
    expect(board.getCurrentDeckSize()).toEqual(deckSize - 1);
    expect(game.getCurrentTurn()).toEqual(turn + 1);
  });

  it('Récupére l\'état du plateau de jeu d\'une partie en cours:', () => {
    expect(game.getBoardState() instanceof BoardState).toBeTruthy();
  });

  it('Consulte la carte visible sur le plateau de jeu:', () => {
    const currentCard = game.getBoardState().getCurrentCard();
    expect(currentCard instanceof Card).toBeTruthy();
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

  it('Revient premier joueur dans la liste des joueurs après un tour si c\'était le dernier joueur:', () => {
    const playerList = game.getPlayers();
    game.playNextTurn();
    game.playNextTurn();
    const activePlayer = game.getBoardState().getActivePlayer();
    expect(playerList.indexOf(activePlayer)).toEqual(playerList.length - 1);
    game.playNextTurn();
    const nextActivePlayer = game.getBoardState().getActivePlayer();
    expect(playerList.indexOf(nextActivePlayer)).toEqual(0);
  });
});

// **************************************************************************************
describe('Manipuler une carte:', () => {
  it('Créé une carte de valeur 3', () => {
    expect(new Card(3).getValue()).toEqual(3);
  });

  it('Echoue à créer une carte de valeur 2', () => {
    expect(() => new Card(2)).toThrowError('INVALID_CARD_VALUE');
  });

  it('Echoue à créer une carte de valeur 36', () => {
    expect(() => new Card(36)).toThrowError('INVALID_CARD_VALUE');
  });
});

// **************************************************************************************
describe('Manipuler le tas de jetons du plateau:', () => {
  let board: BoardState;

  beforeEach(() => {
    board = new BoardState(['Anna', 'Bob', 'David']);
  });

  it('Ajoute un jeton au tas de jeton du plateau de jeu:', () => {
    const bagSize = board.getCurrentTokenBagSize();
    board.addTokenToBag();
    expect(board.getCurrentTokenBagSize()).toEqual(bagSize + 1);
  });

  it('Retire un jeton au tas de jeton du plateau de jeu:', () => {
    const bagSize = board.getCurrentTokenBagSize();
    board.removeTokenFromBag();
    expect(board.getCurrentTokenBagSize()).toEqual(bagSize - 1);
  });
});

// **************************************************************************************
describe('Manipuler le plateau de jeu:', () => {
  let board: BoardState;

  beforeEach(() => {
    board = new BoardState(['Anna', 'Bob', 'David']);
  });

  it('Créé un plateau de jeu avec 24 cartes différentes:', () => {
    const cards: Card[] = [];
    while (board.getCurrentDeckSize() > 0) {
      cards.push(board.getCurrentCard());
      board.take();
    }
    cards.push(board.getCurrentCard());
    const cardValues = cards.map((card) => card.getValue());
    const filteredValues = [... new Set(cardValues)];
    expect(filteredValues.length).toEqual(cards.length);
    expect(filteredValues.length).toEqual(24);
  });
});
