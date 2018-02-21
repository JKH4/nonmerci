import Board, { IFullBoardState, IPlayerBoardState } from '../../src/core/board';
import Card from '../../src/core/card';
import Deck from '../../src/core/deck';
import Game, { GameAction } from '../../src/core/game';

describe('Gestion du plateau', () => {
  // **************************************************************************************
  describe('Initialiser le plateau de jeu:', () => {
    let board: Board;

    it('Initialise un plateau avec juste le nom des joueurs', () => {
      expect(() => board = new Board({ players: ['Anna', 'Bob', 'David']})).not.toThrowError();
      const fullState = board.getState();
      expect(fullState.activePlayer).toEqual('Anna');
      expect(fullState.turn).toEqual(1);
      expect(fullState.board.deck.length).toEqual(24 - 1);
      expect(fullState.board.playerCards).toEqual([
        { name: 'Anna', cards: [] },
        { name: 'Bob', cards: [] },
        { name: 'David', cards: [] },
      ]);
      expect(fullState.board.visibleCard).toBeGreaterThanOrEqual(3);
      expect(fullState.board.visibleCard).toBeLessThanOrEqual(35);
      expect(fullState.board.visibleTokens).toEqual(0);
      expect(fullState.playerTokens).toEqual([
        { name: 'Anna', hiddenTokens: 11 },
        { name: 'Bob', hiddenTokens: 11 },
        { name: 'David', hiddenTokens: 11 },
      ]);
    });

    it('Renvoie une erreur si on tente d\'initialiser le plateau sans joueur', () => {
      expect(() => board = new Board({players: []})).toThrowError('INVALID_NUMBER_OF_PLAYER');
    });

    it('Renvoie une erreur si on tente d\'initialiser le plateau avec + de 5 joueurs', () => {
      expect(() => board = new Board({players: ['j1', 'j2', 'j3', 'j4', 'j5', 'j6']}))
        .toThrowError('INVALID_NUMBER_OF_PLAYER');
    });

    it('Initialise un plateau a partir d\'un état complet du plateau', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur2',
        board: {
          deck: [10, 25, 11, 3, 35],
          playerCards: [
            { name: 'Joueur1', cards: [4, 5] },
            { name: 'Joueur2', cards: [6, 7] },
            { name: 'Joueur3', cards: [8, 9] },
          ],
          visibleCard: 29,
          visibleTokens: 4,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 7 },
          { name: 'Joueur3', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      expect(() => board = new Board({ fullBoardState })).not.toThrowError();

      const fullState = board.getState();
      expect(fullState).toEqual(fullBoardState);
    });

    it('Renvoie une erreur l\'état du plateau n\'est pas valide (activePlayer incohérent)', () => {
      const invalidState: IFullBoardState = {
        activePlayer: 'JoueurX', // PAS DANS LES LISTES CI-DESSOUS
        board: {
          deck: [],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 29,
          visibleTokens: 4,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 11 },
          { name: 'Joueur3', hiddenTokens: 11 },
        ],
        turn: 10,
      };
      expect(() => board = new Board({ fullBoardState: invalidState })).toThrowError('INVALID_BOARD_STATE');
    });

    it('Renvoie une erreur l\'état du plateau n\'est pas valide (playerCards/Tokens incohérents)', () => {
      const invalidState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'JoueurX', cards: [] }, // INCOHERENT
          ],
          visibleCard: 29,
          visibleTokens: 4,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 11 },
          { name: 'Joueur3', hiddenTokens: 11 },
        ],
        turn: 10,
      };
      expect(() => board = new Board({ fullBoardState: invalidState })).toThrowError('INVALID_BOARD_STATE');
    });

    it('Renvoie une erreur l\'état du plateau n\'est pas valide (cartes en double 1)', () => {
      const invalidState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3], // DOUBLON
          playerCards: [
            { name: 'Joueur1', cards: [3] }, // DOUBLON
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 29,
          visibleTokens: 4,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 11 },
          { name: 'Joueur3', hiddenTokens: 11 },
        ],
        turn: 10,
      };
      expect(() => board = new Board({ fullBoardState: invalidState })).toThrowError('INVALID_BOARD_STATE');
    });

    it('Renvoie une erreur l\'état du plateau n\'est pas valide (cartes en double 1)', () => {
      const invalidState2: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3],
          playerCards: [
            { name: 'Joueur1', cards: [29] }, // DOUBLON
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 29, // DOUBLON
          visibleTokens: 4,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 11 },
          { name: 'Joueur3', hiddenTokens: 11 },
        ],
        turn: 10,
      };
      expect(() => board = new Board({ fullBoardState: invalidState2 })).toThrowError('INVALID_BOARD_STATE');
    });

    it('Renvoie une erreur l\'état du plateau n\'est pas valide (cartes en double 3)', () => {
      const invalidState3: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3], // DOUBLON
          playerCards: [
            { name: 'Joueur1', cards: [29] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 3, // DOUBLON
          visibleTokens: 4,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 11 },
          { name: 'Joueur3', hiddenTokens: 11 },
        ],
        turn: 10,
      };
      expect(() => board = new Board({ fullBoardState: invalidState3 })).toThrowError('INVALID_BOARD_STATE');
    });

  });

  describe('Accéder aux informations du plateau de jeu vu par un joueur:', () => {
    let fullBoardState: IFullBoardState;
    let board: Board;
    let playerState: IPlayerBoardState;

    beforeEach(() => {
      fullBoardState = {
        activePlayer: 'Joueur2',
        board: {
          deck: [30, 31, 32, 33, 34],
          playerCards: [
            { name: 'Joueur1', cards: [3, 4, 5] },
            { name: 'Joueur2', cards: [6, 7] },
            { name: 'Joueur3', cards: [8, 9, 10, 11] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      board = new Board({ fullBoardState });
      playerState = board.getPlayerState();
    });

    it('Récupère l\'état d\'un joueur', () => {
      expect(typeof playerState).toBe('object');
      expect(playerState).not.toBeUndefined();
    });

    it('Récupère l\'état du joueur actif si pas de joueur précisé', () => {
      expect(playerState.activePlayer).toEqual('Joueur2');
      expect(playerState.privateData.playerName).toEqual('Joueur2');
    });

    it('Récupère l\'état du joueur spécifié', () => {
      const specificPlayerState = board.getPlayerState('Joueur3');
      expect(specificPlayerState.activePlayer).toEqual('Joueur2');
      expect(specificPlayerState.privateData.playerName).toEqual('Joueur3');
    });

    it('Echoue à accèder aux infos du joueur erronné', () => {
      expect(() => board.getPlayerState('Toto')).toThrowError('INVALID_PLAYER');
    });

    it('Accède aux infos privées du joueur via l\'état du joueur', () => {
      expect(playerState.privateData.playerName).toEqual('Joueur2');
      expect(playerState.privateData.hiddenTokens).toEqual(10);
      expect(playerState.privateData.currentScore).toEqual(6 - 10);
    });

    it('Accède aux infos du plateau via l\'état du joueur', () => {
      expect(playerState.board.visibleCard).toEqual(35);
      expect(playerState.board.deckSize).toEqual(5);
      expect(playerState.board.visibleTokens).toEqual(3);
      expect(playerState.board.playerCards).toEqual([
        {name: 'Joueur1', cards: [3, 4, 5] },
        {name: 'Joueur2', cards: [6, 7] },
        {name: 'Joueur3', cards: [8, 9, 10, 11] },
      ]);
    });

    it('Accède au tour courrant via via l\'état du joueur', () => {
      expect(playerState.turn).toEqual(30);
    });
  });

  describe('Accéder aux informations complètes du plateau de jeu:', () => {
    let fullBoardState: IFullBoardState;
    let board: Board;
    let fullState: IFullBoardState;

    beforeEach(() => {
      fullBoardState = {
        activePlayer: 'Joueur2',
        board: {
          deck: [30, 31, 32, 33, 34],
          playerCards: [
            { name: 'Joueur1', cards: [3, 4, 5] },
            { name: 'Joueur2', cards: [6, 7] },
            { name: 'Joueur3', cards: [8, 9, 10, 11] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      board = new Board({ fullBoardState });
      fullState = board.getState();
    });

    it('Récupère l\'état complet du plateau', () => {
      expect(typeof fullState).toBe('object');
      expect(fullState).not.toBeUndefined();
    });

    it('Accède au nom du joueur actif via l\'état complet du plateau', () => {
      expect(fullState.activePlayer).toEqual('Joueur2');
    });

    it('Accède au numéro du tour en cours via l\'état complet du plateau', () => {
      expect(fullState.turn).toEqual(30);
    });

    it('Accède aux infos du board via l\'état complet du plateau', () => {
      expect(typeof fullState.board).toBe('object');
      expect(fullState.board).not.toBeUndefined();
    });

    it('Accède au deck (board) via l\'état complet du plateau', () => {
      expect(fullState.board.deck).toEqual([30, 31, 32, 33, 34]);
    });

    it('Accède à la carte visible (board) via l\'état complet du plateau', () => {
      expect(fullState.board.visibleCard).toEqual(35);
    });

    it('Accède aux jetons associées à la carte visible (board) via l\'état complet du plateau', () => {
      expect(fullState.board.visibleTokens).toEqual(3);
    });

    it('Accède aux cartes de chaque joueur (board) via l\'état complet du plateau', () => {
      expect(fullState.board.playerCards.find((p) => p.name === 'Joueur1').cards).toEqual([3, 4, 5]);
      expect(fullState.board.playerCards.find((p) => p.name === 'Joueur2').cards).toEqual([6, 7]);
      expect(fullState.board.playerCards.find((p) => p.name === 'Joueur3').cards).toEqual([8, 9, 10, 11]);
      expect(fullState.board.playerCards.find((p) => p.name === 'Personne')).toBeUndefined();
    });

    it('Accède aux jetons cachés de chaque joueur via l\'état complet du plateau', () => {
      expect(fullState.playerTokens.find((p) => p.name === 'Joueur1').hiddenTokens).toEqual(11);
      expect(fullState.playerTokens.find((p) => p.name === 'Joueur2').hiddenTokens).toEqual(10);
      expect(fullState.playerTokens.find((p) => p.name === 'Joueur3').hiddenTokens).toEqual(9);
      expect(fullState.playerTokens.find((p) => p.name === 'Personne')).toBeUndefined();
    });
  });

  describe('Accéder aux scores:', () => {
    let fullBoardState: IFullBoardState;
    let board: Board;
    let fullState: IFullBoardState;

    beforeEach(() => {
      fullBoardState = {
        activePlayer: 'Joueur2',
        board: {
          deck: [30, 31, 32, 33, 34],
          playerCards: [
            { name: 'Joueur1', cards: [3, 4, 5] },
            { name: 'Joueur2', cards: [6, 7] },
            { name: 'Joueur3', cards: [8, 9, 10, 11] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      board = new Board({ fullBoardState });
      fullState = board.getState();
    });

    it('Accéde aux scores courrant de la partie', () => {
      const scores = board.getScores();
      expect(scores.find(([name, score]) => name === 'Joueur1')[1]).toEqual(3 - 11);
      expect(scores.find(([name, score]) => name === 'Joueur2')[1]).toEqual(6 - 10);
      expect(scores.find(([name, score]) => name === 'Joueur3')[1]).toEqual(8 - 9);
    });

    it('Classe les scores du meilleur au moins bon', () => {
      const scores = board.getScores();
      expect(scores[0][1]).toEqual(3 - 11);
      expect(scores[1][1]).toEqual(6 - 10);
      expect(scores[2][1]).toEqual(8 - 9);
    });
  });

  describe('Valider l\'intégrité de l\'état du plateau de jeu:', () => {
    it('Conserve le nombre de jeton à 11 x nb joueur en jeu après une action Take', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      board.take();
      const fullState = board.getState();
      const tokens = fullState.board.visibleTokens + fullState.playerTokens
        .map(({name, hiddenTokens}) => hiddenTokens)
        .reduce((prev, curr) => prev + curr, 0);
      expect(tokens).toEqual(33);
    });

    it('Conserve le nombre de jeton à 11 x nb joueur en jeu après une action Pay', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      board.pay();
      const fullState = board.getState();
      const tokens = fullState.board.visibleTokens + fullState.playerTokens
        .map(({name, hiddenTokens}) => hiddenTokens)
        .reduce((prev, curr) => prev + curr, 0);
      expect(tokens).toEqual(33);
    });

    it('Conserve le nombre de jeton à 11 x nb joueur en jeu après une action RevealNewCard', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      board.revealNewCard();
      const fullState = board.getState();
      const tokens = fullState.board.visibleTokens + fullState.playerTokens
        .map(({name, hiddenTokens}) => hiddenTokens)
        .reduce((prev, curr) => prev + curr, 0);
      expect(tokens).toEqual(33);
    });

    it('Conserve le nombre de jeton à 11 x nb joueur en jeu après une action switchActivePlayer', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      board.switchActivePlayer();
      const fullState = board.getState();
      const tokens = fullState.board.visibleTokens + fullState.playerTokens
        .map(({name, hiddenTokens}) => hiddenTokens)
        .reduce((prev, curr) => prev + curr, 0);
      expect(tokens).toEqual(33);
    });

    it('Conserve le nombre de jeton à 11 x nb joueur en jeu après une action incrementTurn', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      board.incrementTurn();
      const fullState = board.getState();
      const tokens = fullState.board.visibleTokens + fullState.playerTokens
        .map(({name, hiddenTokens}) => hiddenTokens)
        .reduce((prev, curr) => prev + curr, 0);
      expect(tokens).toEqual(33);
    });
  });

  // **************************************************************************************
  describe('Résoudre les actions de jeu:', () => {
    it('Résoud l\'action PAY en transférant un jeton de la réserve du joueur actif vers le tas', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      const fullState = board.getState();

      const player = fullState.activePlayer;
      const card = fullState.board.visibleCard;
      const playerTokens = fullState.playerTokens.find((p) => p.name === player).hiddenTokens;
      const cardTokens = fullState.board.visibleTokens;

      expect(() => board.pay()).not.toThrowError();

      const newFullState = board.getState();

      expect(newFullState.playerTokens.find((p) => p.name === player).hiddenTokens).toEqual(playerTokens - 1);
      expect(newFullState.board.visibleTokens).toEqual(cardTokens + 1);
      expect(newFullState.board.playerCards.find((p) => p.name === player).cards.indexOf(card)).toEqual(-1);
      expect(newFullState.board.visibleCard).toEqual(card);
    });

    it('Echoue à résoudre l\'action PAY si le joueur actif n\'a pas de jeton:', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 0 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      expect(() => board.pay()).toThrowError('NOT_ENOUGH_TOKENS');
    });

    it('Echoue à résoudre l\'action PAY s\'il n\'y a pas de carte visible:', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      expect(() => board.pay()).toThrowError('NO_VISIBLE_CARD');
    });

    it('Résoud l\'action TAKE en transférant la carte visible et les jetons du tas au joueur actif', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      const fullState = board.getState();

      const player = fullState.activePlayer;
      const card = fullState.board.visibleCard;
      const playerTokens = fullState.playerTokens.find((p) => p.name === player).hiddenTokens;
      const cardTokens = fullState.board.visibleTokens;
      expect(() => board.take()).not.toThrowError();

      const newFullState = board.getState();
      expect(newFullState.playerTokens.find((p) => p.name === player).hiddenTokens).toEqual(playerTokens + cardTokens);
      expect(newFullState.board.visibleTokens).toEqual(0);
      expect(newFullState.board.playerCards.find((p) => p.name === player).cards.find((c) => c === card))
        .not.toBeUndefined();
      expect(newFullState.board.visibleCard).toBe(undefined);
    });

    it('Echoue à résoudre l\'action TAKE s\'il n\'y a pas de carte visible:', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      expect(() => board.take()).toThrowError('NO_VISIBLE_CARD');
    });

    it('Révèle la prochaine carte du deck', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [3, 4, 5, 6],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 0 },
          { name: 'David', hiddenTokens: 0 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      expect(() => board.revealNewCard()).not.toThrowError();
      const newState = board.getState();
      expect(newState.board.visibleCard).toEqual(6);
    });

    it('Echoue à révèler une nouvelle carte du deck s\'il y a déjà une carte révélée', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      expect(() => board.revealNewCard()).toThrowError('CARD_ALREADY_REVEALED');
    });

    it('Signale la fin de la partie si on tente de révéler une carte alors que le deck est vide:', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      expect(() => board.revealNewCard()).toThrowError('END_OF_GAME');
    });

    it('Incrémente le tour', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      board.incrementTurn();
      expect(board.getState().turn).toEqual(30 + 1);
    });

  });

  // **************************************************************************************
  describe('Calculer le score d\'un joueur:', () => {
    it('Donne un score courrant de -11 à un joueur qui n\'a aucune carte dans sa pile et 11 jetons:', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 0 },
          { name: 'David', hiddenTokens: 0 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(board.getPlayerState('Anna').privateData.currentScore).toEqual(-11);
    });

    it('Donne un score courrant de -9 à un joueur qui seulement la carte 3 dans sa pile et 11 jetons:', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [3, 4] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 0 },
          { name: 'David', hiddenTokens: 0 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      expect(board.getPlayerState('Anna').privateData.currentScore).toEqual(3 - 11);
    });

    it('Donne un score courrant de 28 à un joueur qui a les cartes 5, 25 et 26 dans sa pile et 2 jetons:', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [5, 25, 26] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 2 },
          { name: 'Bob', hiddenTokens: 0 },
          { name: 'David', hiddenTokens: 0 },
        ],
        turn: 30,
      };

      const board = new Board({ fullBoardState });
      expect(board.getPlayerState('Anna').privateData.currentScore).toEqual(5 + 25 - 2);
    });
  });

  describe('interface MCTS', () => {
    it('Renvoi des actions de jeu possibles si une carte est visible (et pas des tirages)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      const moves = board.getPossibleMoves();
      (moves as GameAction[]).forEach((move) => {
        expect(Object.keys(GameAction)).toContain(move);
      });
    });

    it('Renvoi des tirages possibles si pas de carte visible et deck non vide (et pas des actions de jeu)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      const moves = board.getPossibleMoves();
      (moves as Card[]).forEach((move) => {
        expect(move).toEqual(jasmine.any(Card));
      });
    });

    it('Renvoi les 2 actions possibles si le joueur actif a des jetons et une carte est visible', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      const moves = board.getPossibleMoves();
      expect(moves.length).toEqual(2);
      expect(moves).toContain(GameAction.Take);
      expect(moves).toContain(GameAction.Pay);
    });

    it('Renvoi l\'action possible TAKE si le joueur actif n\'a pas de jeton (et une carte est visible)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Bob',
        board: {
          deck: [4, 5, 6],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: 3,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 0 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({ fullBoardState });
      const moves = board.getPossibleMoves();
      expect(board.getPossibleMoves()).toEqual([GameAction.Take]);
    });

    it('Renvoie toutes les cartes sauf celles déjà visibles quand on demande les tirages possibles', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [12, 13, 14],
          playerCards: [
            { name: 'Anna', cards: [3, 4, 5] },
            { name: 'Bob', cards: [6, 7, 8] },
            { name: 'David', cards: [9, 10, 11] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const fixedBoard = new Board({fullBoardState});
      const moves = fixedBoard.getPossibleMoves();
      const drawsValues = (moves as Card[]).map((c) => c.getValue());
      expect(drawsValues).toEqual([12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]);
    });

    it('Ne renvoie rien si le deck est vide quand on demande les tirages possibles', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [3, 4, 5] },
            { name: 'Bob', cards: [6, 7, 8] },
            { name: 'David', cards: [9, 10, 11] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(board.getPossibleMoves()).toEqual([]);
    });

    it('Renvoie le joueur actif', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Bob',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [3, 4, 5] },
            { name: 'Bob', cards: [6, 7, 8] },
            { name: 'David', cards: [9, 10, 11] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(board.getCurrentPlayer()).toEqual('Bob');
    });

    it('Réalise un TAKE sur un performMove(Take)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      const takeSpy = spyOn(board, 'take');
      board.performMove(GameAction.Take);
      expect(takeSpy).toHaveBeenCalled();
    });

    it('Réalise un PAY et un SwitchActivePlayer sur un performMove(Pay)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Joueur1',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Joueur1', cards: [] },
            { name: 'Joueur2', cards: [] },
            { name: 'Joueur3', cards: [] },
          ],
          visibleCard: 35,
          visibleTokens: 3,
        },
        playerTokens: [
          { name: 'Joueur1', hiddenTokens: 11 },
          { name: 'Joueur2', hiddenTokens: 10 },
          { name: 'Joueur3', hiddenTokens: 9 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      const takeSpy = spyOn(board, 'pay');
      const switchSpy = spyOn(board, 'switchActivePlayer');
      board.performMove(GameAction.Pay);
      expect(takeSpy).toHaveBeenCalled();
      expect(switchSpy).toHaveBeenCalled();
    });

    it('Fait apparaitre la carte requise et retire une carte du deck sur un performMove(card)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [3, 4, 5],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      board.performMove(new Card(10));
      const newState = board.getPlayerState();
      expect(newState.board.deckSize).toEqual(3 - 1);
      expect(newState.board.visibleCard).toEqual(10);
    });

    it('Echoue a faire apparaitre une carte déjà révélée sur un performMove(card)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [4, 5],
          playerCards: [
            { name: 'Anna', cards: [3] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(() => board.performMove(new Card(3))).toThrowError('CARD_ALREADY_ON_BOARD');
    });

    it('Echoue a faire apparaitre une carte s\'il y a déjà une carte visible sur un performMove(card)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [4, 5],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: 3,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(() => board.performMove(new Card(10))).toThrowError('INVALID_ACTION');
    });

    it('Echoue a faire apparaitre une carte si le deck est vide sur un performMove(card)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(() => board.performMove( new Card(10))).toThrowError('END_OF_GAME');
    });

    it('Ne renvoie rien si la partie n\'est pas terminée (deck non vide)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Bob',
        board: {
          deck: [3],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(board.getWinner()).toEqual(null);
    });

    it('Ne renvoie rien si la partie n\'est pas terminée (carte visible)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Bob',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [] },
            { name: 'Bob', cards: [] },
            { name: 'David', cards: [] },
          ],
          visibleCard: 3,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(board.getWinner()).toEqual(null);
    });

    it('Renvoie le nom du joueur avec le plus petit score si la partie est pas terminée\n' +
    '(deck vide & pas de carte visible)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Bob',
        board: {
          deck: [],
          playerCards: [
            { name: 'Anna', cards: [3, 4, 5] },
            { name: 'Bob', cards: [6, 7, 8] },
            { name: 'David', cards: [9, 10, 11] },
          ],
          visibleCard: undefined,
          visibleTokens: 0,
        },
        playerTokens: [
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 11 },
          { name: 'David', hiddenTokens: 11 },
        ],
        turn: 30,
      };
      const board = new Board({fullBoardState});
      expect(board.getWinner()).toEqual('Anna');
    });
  });
});
