import Board, { IFullBoardState, IPlayerBoardState } from '../../src/core/board';
import Card from '../../src/core/card';
import Deck from '../../src/core/deck';
import { GameAction } from '../../src/core/game';

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
      // expect('Test a implémenter').toBe('Test implémenté');
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

    it('Renvoie une erreur l\'état du plateau n\'est pas valide (cartes en double)', () => {
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
      expect(() => board = new Board({ fullBoardState: invalidState })).toThrowError('INVALID_BOARD_STATE');
      expect(() => board = new Board({ fullBoardState: invalidState2 })).toThrowError('INVALID_BOARD_STATE');
      expect(() => board = new Board({ fullBoardState: invalidState3 })).toThrowError('INVALID_BOARD_STATE');
    });

  });

  describe('Accéder aux informations du plateau de jeu vu par un joueur:', () => {
    let board: Board;
    let playerState: IPlayerBoardState;

    beforeEach(() => {
      board = new Board({players: ['Anna', 'Bob', 'David']});
      playerState = board.getPlayerState();
    });

    it('Récupère l\'état d\'un joueur', () => {
      expect(typeof playerState).toBe('object');
      expect(playerState).not.toBeUndefined();
    });

    it('Récupère l\'état du joueur actif si pas de joueur précisé', () => {
      expect(playerState.activePlayer).toEqual('Anna');
      expect(playerState.privateData.playerName).toEqual('Anna');
    });

    it('Récupère l\'état du joueur spécifié', () => {
      const specificPlayerState = board.getPlayerState('David');
      expect(specificPlayerState.activePlayer).toEqual('Anna');
      expect(specificPlayerState.privateData.playerName).toEqual('David');
    });

    it('Echoue à accèder aux infos du joueur erronné', () => {
      expect(() => board.getPlayerState('Toto')).toThrowError('INVALID_PLAYER');
    });

    it('Accède aux infos privées du joueur via l\'état du joueur', () => {
      expect(playerState.privateData.playerName).toEqual('Anna');
      expect(playerState.privateData.hiddenTokens).toEqual(11);
      expect(playerState.privateData.currentScore).toEqual(0 - 11);
    });

    it('Accède aux infos du plateau via l\'état du joueur', () => {
      expect(playerState.board.visibleCard).toBeGreaterThanOrEqual(3);
      expect(playerState.board.visibleCard).toBeLessThanOrEqual(35);
      expect(playerState.board.deckSize).toEqual(24 - 1);
      expect(playerState.board.visibleTokens).toEqual(0);
      expect(playerState.board.playerCards).toEqual([
        {name: 'Anna', cards: [] }, {name: 'Bob', cards: [] }, {name: 'David', cards: [] }]);
    });

    it('Accède au tour courrant via via l\'état du joueur', () => {
      expect(playerState.turn).toEqual(1);
    });
  });

  describe('Accéder aux informations complètes du plateau de jeu:', () => {
    let board: Board;
    let fullState: IFullBoardState;

    beforeEach(() => {
      board = new Board({players: ['Anna', 'Bob', 'David']});
      fullState = board.getState();
    });

    it('Récupère l\'état complet du plateau', () => {
      expect(typeof fullState).toBe('object');
      expect(fullState).not.toBeUndefined();
    });

    it('Accède au nom du joueur actif via l\'état complet du plateau', () => {
      expect(fullState.activePlayer).toEqual('Anna');
    });

    it('Accède au numéro du tour en cours via l\'état complet du plateau', () => {
      expect(fullState.turn).toEqual(1);
    });

    it('Accède aux infos du board via l\'état complet du plateau', () => {
      expect(typeof fullState.board).toBe('object');
      expect(fullState.board).not.toBeUndefined();
    });

    it('Accède au deck (board) via l\'état complet du plateau', () => {
      expect(fullState.board.deck.every((c) => c <= 35 && c >= 3)).toBeTruthy();
      expect(fullState.board.deck.length).toEqual(24 - 1);
    });

    it('Accède à la carte visible (board) via l\'état complet du plateau', () => {
      expect(fullState.board.visibleCard).toBeGreaterThanOrEqual(3);
      expect(fullState.board.visibleCard).toBeLessThanOrEqual(35);
      expect(fullState.board.visibleCard).not.toBeUndefined();
    });

    it('Accède aux jetons associées à la carte visible (board) via l\'état complet du plateau', () => {
      expect(fullState.board.visibleTokens).toEqual(0);
    });

    it('Accède aux cartes de chaque joueur (board) via l\'état complet du plateau', () => {
      expect(fullState.board.playerCards.find((p) => p.name === 'Anna').cards).toEqual([]);
      expect(fullState.board.playerCards.find((p) => p.name === 'Bob').cards).toEqual([]);
      expect(fullState.board.playerCards.find((p) => p.name === 'David').cards).toEqual([]);
      expect(fullState.board.playerCards.find((p) => p.name === 'Personne')).toBeUndefined();
    });

    it('Accède aux jetons cachés de chaque joueur via l\'état complet du plateau', () => {
      expect(fullState.playerTokens.find((p) => p.name === 'Anna').hiddenTokens).toEqual(11);
      expect(fullState.playerTokens.find((p) => p.name === 'Bob').hiddenTokens).toEqual(11);
      expect(fullState.playerTokens.find((p) => p.name === 'David').hiddenTokens).toEqual(11);
      expect(fullState.playerTokens.find((p) => p.name === 'Personne')).toBeUndefined();
    });
  });

  describe('Valider l\'intégrité de l\'état du plateau de jeu:', () => {
    let board: Board;
    let fullState: IFullBoardState;

    beforeEach(() => {
      board = new Board({players: ['Anna', 'Bob', 'David']});
      fullState = board.getState();
    });

    it('Créé par défaut un plateau de jeu avec 24 cartes différentes:', () => {
      const cards = [...fullState.board.deck, fullState.board.visibleCard];
      expect(cards.length).toEqual(24);
      expect([... new Set(cards)]).toEqual(cards);
    });

    it('Conserve le nombre de jeton à 11 x nb joueur en jeu après une action', () => {
      const initTotalTokens = fullState.board.visibleTokens
        + fullState.playerTokens.map(({name, hiddenTokens}) => hiddenTokens).reduce((prev, curr) => prev + curr, 0);

      board.take();
      board.revealNewCard();
      board.switchActivePlayer();
      const fullStateTake = board.getState();
      const totalTokensTake = fullStateTake.board.visibleTokens
        + fullStateTake.playerTokens.map(({name, hiddenTokens}) => hiddenTokens).reduce((prev, curr) => prev + curr, 0);
      expect(initTotalTokens).toEqual(totalTokensTake);

      board.pay();
      board.switchActivePlayer();
      const fullStatePay = board.getState();
      const totalTokensPay = fullStatePay.board.visibleTokens
        + fullStatePay.playerTokens.map(({name, hiddenTokens}) => hiddenTokens).reduce((prev, curr) => prev + curr, 0);
      expect(initTotalTokens).toEqual(totalTokensPay);
    });

  });

  // **************************************************************************************
  describe('Résoudre les actions de jeu:', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board({players: ['Anna', 'Bob', 'David']});
    });

    it('Résoud l\'action PAY en transférant un jeton de la réserve du joueur actif vers le tas', () => {
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

    it('Résoud l\'action TAKE en transférant la carte visible et les jetons du tas au joueur actif', () => {
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

    it('Signale la fin de la partie s\'il n\'y a plus de carte dans le deck après une action REVEAL:', () => {
      while (board.getPlayerState().board.deckSize > 0) {
        expect(() => board.take()).not.toThrowError();
        expect(() => board.revealNewCard()).not.toThrowError();
      }
      expect(() => board.take()).not.toThrowError();
      expect(() => board.revealNewCard()).toThrowError('END_OF_GAME');
      const newBoardState = board.getState();

      expect(newBoardState.board.deck).toEqual([]);
      expect(newBoardState.board.visibleCard).toBeUndefined();
    });

    it('Echoue à résoudre l\'action PAY si le joueur actif n\'a pas de jeton:', () => {
      while (board.getPlayerState().privateData.hiddenTokens > 0) {
        expect(() => board.pay()).not.toThrowError();
      }
      expect(board.getPlayerState().privateData.hiddenTokens).toEqual(0);
      expect(() => board.pay()).toThrowError('NOT_ENOUGH_TOKENS');
    });

    it('Echoue à résoudre une action PAY ou TAKE s\'il n\'y a pas de carte visible:', () => {
      while (board.getPlayerState().board.deckSize > 0) {
        expect(() => board.take()).not.toThrowError();
        expect(() => board.revealNewCard()).not.toThrowError();
      }
      expect(() => board.take()).not.toThrowError('END_OF_GAME');
      expect(() => board.revealNewCard()).toThrowError('END_OF_GAME');

      expect(() => board.pay()).toThrowError('NO_VISIBLE_CARD');
      expect(() => board.take()).toThrowError('NO_VISIBLE_CARD');
    });

    it('Ne propose plus de carte visible après qu\'un joueur ai pris (TAKE) la dernière carte:', () => {
      while (board.getPlayerState().board.deckSize > 0) {
        expect(() => board.take()).not.toThrowError();
        expect(() => board.revealNewCard()).not.toThrowError();
      }
      expect(() => board.take()).not.toThrowError();
      expect(() => board.revealNewCard()).toThrowError('END_OF_GAME');
      const newBoardState = board.getPlayerState();

      expect(newBoardState.board.visibleCard).toBeUndefined();
    });

    it('Incrémente le tour', () => {
      const turn = board.getState().turn;
      board.incrementTurn();
      expect(board.getState().turn).toEqual(turn + 1);
    });

    it('Révèle une nouvelle carte du deck', () => {
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
      const fixedBoard = new Board({ fullBoardState });
      const state = fixedBoard.getState();
      expect(() => fixedBoard.revealNewCard()).not.toThrowError();
      const newState = fixedBoard.getState();
      expect(state.board.visibleCard).toBeUndefined();
      expect(newState.board.visibleCard).toEqual(6);
    });

    it('Echoue à révèler une nouvelle carte du deck s\'il y a déjà une carte révélée', () => {
      expect(board.getState().board.visibleCard).not.toBeUndefined();
      expect(() => board.revealNewCard()).toThrowError('CARD_ALREADY_REVEALED');
    });
  });

  // **************************************************************************************
  describe('Calculer le score d\'un joueur:', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board({players: ['Anna', 'Bob', 'David']});
    });

    it('Donne un score final de -11 à un joueur qui n\'a aucune carte dans sa pile et 11 jetons:', () => {
      const playerScore = board.getPlayerState().privateData.currentScore;
      expect(playerScore).toEqual(-11);
    });

    it('Donne un score final de -9 à un joueur qui seulement la carte 3 dans sa pile et 11 jetons:', () => {
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
      const fixedBoard = new Board({ fullBoardState });
      const playerScore = fixedBoard.getPlayerState().privateData.currentScore;
      expect(playerScore).toEqual(3 - 11);
    });

    it('Donne un score final de 19 à un joueur qui a les cartes 5, 25 et 26 dans sa pile et 11 jetons:', () => {
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
          { name: 'Anna', hiddenTokens: 11 },
          { name: 'Bob', hiddenTokens: 0 },
          { name: 'David', hiddenTokens: 0 },
        ],
        turn: 30,
      };
      const fixedBoard = new Board({ fullBoardState });

      const playerScore = fixedBoard.getPlayerState().privateData.currentScore;
      expect(playerScore).toEqual(5 + 25 - 11);
    });
  });
  describe('interface MCTS', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board({players: ['Anna', 'Bob', 'David']});
    });

    it('Renvoi les 2 actions possibles en début de partie', () => {
      expect(board.getPossibleMoves()).toContain(GameAction.Take);
      expect(board.getPossibleMoves()).toContain(GameAction.Pay);
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
      const fixedBoard = new Board({fullBoardState});
      expect(fixedBoard.getPossibleMoves()).toEqual([GameAction.Take]);
      // expect(board.getPossibleMoves()).toContain(GameAction.Pay);
    });

    it('Renvoi rien? si il ny a pas de carte visible)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Bob',
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
      const fixedBoard = new Board({fullBoardState});
      expect(fixedBoard.getPossibleMoves()).toEqual([]);
      // expect(board.getPossibleMoves()).toContain(GameAction.Pay);
    });

    it('Renvoi "(35 - 2) - 1" cartes dans les tirages possibles en début de partie', () => {
      const draws = board.getPossibleDraws();
      expect(draws.length).toEqual((35 - 2) - 1);
    });

    it('Renvoie la bonne liste de cartes quand on demande les tirages possibles (fixedBoard)', () => {
      const fullBoardState: IFullBoardState = {
        activePlayer: 'Anna',
        board: {
          deck: [13, 14, 15],
          playerCards: [
            { name: 'Anna', cards: [3, 4, 5] },
            { name: 'Bob', cards: [6, 7, 8] },
            { name: 'David', cards: [9, 10, 11] },
          ],
          visibleCard: 12,
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
      const state = fixedBoard.getState();
      // console.log(fixedBoard.getPossibleDraws());
      const drawsValues = fixedBoard.getPossibleDraws().map((c) => c.getValue());
      expect(drawsValues).toEqual([13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]);
    });

    it('Ne renvoie rien si le deck est vide quand on demande les tirages possibles (fixedBoard)', () => {
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
      const fixedBoard = new Board({fullBoardState});
      expect(fixedBoard.getPossibleDraws()).toEqual([]);
    });

    it('Ne renvoi pas les cartes déjà révélées dans les tirages possibles en début de partie', () => {
      const NB_CARDS = 10;
      for (let i = 0; i < NB_CARDS; i++) {
        board.take();
        board.revealNewCard();
      }
      const state = board.getState();
      const drawsValues = board.getPossibleDraws().map((c) => c.getValue());
      expect(drawsValues.length).toEqual((35 - 2) - (NB_CARDS + 1));
      expect(drawsValues).not.toContain(state.board.visibleCard);
      state.board.playerCards.forEach(({name, cards}) => {
        cards.forEach((c) => expect(drawsValues).not.toContain(c));
      });
    });

    it('Réalise un TAKE sur un performMove(Take)', () => {
      const takeSpy = spyOn(board, 'take');
      const revealSpy = spyOn(board, 'revealNewCard');
      board.performMove(GameAction.Take);
      expect(takeSpy).toHaveBeenCalled();
      expect(revealSpy).not.toHaveBeenCalled();
    });

    it('Réalise un PAY sur un performMove(Pay)', () => {
      const takeSpy = spyOn(board, 'pay');
      const switchSpy = spyOn(board, 'switchActivePlayer');
      board.performMove(GameAction.Pay);
      expect(takeSpy).toHaveBeenCalled();
      expect(switchSpy).toHaveBeenCalled();
    });

    it('Fait apparaitre la carte requise sur un performDraw(card)', () => {
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
      const fixedBoard = new Board({fullBoardState});
      const state = fixedBoard.getPlayerState();
      const card = new Card(10);
      fixedBoard.performDraw(card);
      const newState = fixedBoard.getPlayerState();
      expect(newState.board.deckSize).toEqual(state.board.deckSize - 1);
      expect(newState.board.visibleCard).toEqual(10);
    });

    it('Echoue a faire apparaitre une carte déjà révélée sur un performDraw(card)', () => {
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
      const fixedBoard = new Board({fullBoardState});
      const state = fixedBoard.getPlayerState();
      const card = new Card(3);
      expect(() => fixedBoard.performDraw(card)).toThrowError('CARD_ALREADY_ON_BOARD');
    });

    it('Echoue a faire apparaitre une carte déjà révélée sur un performDraw(card)', () => {
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
      const fixedBoard = new Board({fullBoardState});
      const state = fixedBoard.getPlayerState();
      const card = new Card(10);
      expect(() => fixedBoard.performDraw(card)).toThrowError('CARD_ALREADY_REVEALED');
    });

    it('Echoue a faire apparaitre une carte si le deck est vide sur un performDraw(card)', () => {
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
      const fixedBoard = new Board({fullBoardState});
      const state = fixedBoard.getPlayerState();
      const card = new Card(10);
      expect(() => fixedBoard.performDraw(card)).toThrowError('END_OF_GAME');
    });
  });
});
