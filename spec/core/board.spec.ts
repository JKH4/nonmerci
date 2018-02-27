import BoardHelper, {
  ActionType,
  BoardHistory,
  IBoardState,
  IDraw,
  IGameAction,
} from '../../src/core/board-helper';

import Board from '../../src/core/board';

describe('Gestion du plateau:', () => {
  let initState: IBoardState;
  let history: BoardHistory;
  let board: Board;
  beforeEach(() => {
    initState = BoardHelper.getDefaultBoardState();
    history = [
      { type: ActionType.DRAW, payload: 3 },
      { type: ActionType.PAY },
      { type: ActionType.TAKE },
      { type: ActionType.DRAW, payload: 35 },
    ];
    board = new Board(initState, history);
  });
  // **************************************************************************************
  describe('Initialiser le plateau de jeu:', () => {
    it('Initialise le plateau de jeu avec un état initial standard et historique', () => {
      expect(board.getInitState()).toEqual(BoardHelper.getDefaultBoardState());
      expect(board.getState()).toEqual({
        activePlayer: 'Joueur2',
        deckSize: 22,
        players: [
          {name: 'Joueur1', cards: [], hiddenTokens: 10},
          {name: 'Joueur2', cards: [3], hiddenTokens: 12},
          {name: 'Joueur3', cards: [], hiddenTokens: 11},
        ],
        turn: 2,
        visibleCard: 35,
        visibleTokens: 0,
      });
    });
    it('Initialise le plateau de jeu avec un état initial standard et sans historique', () => {
      board = new Board(initState, []);
      expect(board.getInitState()).toEqual(BoardHelper.getDefaultBoardState());
    });
    it('Echoue a initialiser le plateau de jeu avec un état initial invalide', () => {
      initState.players.pop();
      expect(() => new Board(initState, [])).toThrowError();
    });
  });
  // **************************************************************************************
  describe('Résoudre les actions de jeu:', () => {
    it('Résoud l\'action PAY en transférant un jeton de la réserve du joueur actif vers le tas', () => {
      const state = board.getState();

      const player = state.activePlayer;
      const card = state.visibleCard;
      const playerTokens = state.players.find((p) => p.name === player).hiddenTokens;
      const cardTokens = state.visibleTokens;

      expect(() => board.pay()).not.toThrowError();

      const newState = board.getState();
      const newHistory = board.getHistory();

      expect(newState.players.find((p) => p.name === player).hiddenTokens).toEqual(playerTokens - 1);
      expect(newState.visibleTokens).toEqual(cardTokens + 1);
      expect(newState.players.find((p) => p.name === player).cards.indexOf(card)).toEqual(-1);
      expect(newState.visibleCard).toEqual(card);
      expect(newHistory.pop()).toEqual({ type: ActionType.PAY });
    });
    it('Echoue à résoudre l\'action PAY si le joueur actif n\'a pas de jeton:', () => {
      initState.visibleCard = 35;
      initState.visibleTokens = initState.players[0].hiddenTokens;
      initState.players[0].hiddenTokens = 0;
      board = new Board(initState, []);
      expect(() => board.pay()).toThrowError('NOT_ENOUGH_TOKENS');
    });

    it('Echoue à résoudre l\'action PAY s\'il n\'y a pas de carte visible:', () => {
      board = new Board(initState, []);
      expect(() => board.pay()).toThrowError('NO_VISIBLE_CARD');
    });

    it('Résoud l\'action TAKE en transférant la carte visible et les jetons du tas au joueur actif', () => {
      const state = board.getState();

      const player = state.activePlayer;
      const card = state.visibleCard;
      const playerTokens = state.players.find((p) => p.name === player).hiddenTokens;
      const cardTokens = state.visibleTokens;
      expect(() => board.take()).not.toThrowError();

      const newState = board.getState();
      const newHistory = board.getHistory();

      expect(newState.players.find((p) => p.name === player).hiddenTokens).toEqual(playerTokens + cardTokens);
      expect(newState.visibleTokens).toEqual(0);
      expect(newState.players.find((p) => p.name === player).cards.find((c) => c === card))
        .not.toBeUndefined();
      expect(newState.visibleCard).toBe(undefined);
      expect(newHistory.pop()).toEqual({ type: ActionType.TAKE });
    });

    it('Echoue à résoudre l\'action TAKE s\'il n\'y a pas de carte visible:', () => {
      board = new Board(initState, []);
      expect(() => board.take()).toThrowError('NO_VISIBLE_CARD');
    });

    it('Révèle la prochaine carte du deck', () => {
      board = new Board(initState, []);
      const state = board.getState();
      expect(() => board.revealNewCard()).not.toThrowError();
      expect(board.getState().visibleCard).toEqual(jasmine.any(Number));
      expect(board.getState().deckSize).toEqual(state.deckSize - 1);
      const lastLine = (board.getHistory().pop() as IDraw);
      expect(lastLine.type).toEqual(ActionType.DRAW);
      expect(lastLine.payload).toEqual(jasmine.any(Number));
    });

    it('Echoue à révèler une nouvelle carte du deck s\'il y a déjà une carte révélée', () => {
      expect(() => board.revealNewCard()).toThrowError('CARD_ALREADY_REVEALED');
    });

    it('Signale la fin de la partie si on tente de révéler une carte alors que le deck est vide:', () => {
      initState.deckSize = 0;
      board = new Board(initState, []);
      expect(() => board.revealNewCard()).toThrowError('END_OF_GAME');
    });

    it('Incrémente le tour', () => {
      const turn = board.getState().turn;
      board.incrementTurn();
      expect(board.getState().turn).toEqual(turn + 1);
    });
  });

  // **************************************************************************************
  describe('Calculer le score d\'un joueur:', () => {
    it('Donne un score courrant de -11 à un joueur qui n\'a aucune carte dans sa pile et 11 jetons:', () => {
      board = new Board(initState, []);
      expect(board.getScores().find((s) => s[0] === 'Joueur1')[1]).toEqual(-11);
    });

    it('Donne un score courrant de -8 à un joueur qui seulement la carte 3 dans sa pile et 12 jetons:', () => {
      expect(board.getScores().find((s) => s[0] === 'Joueur2')[1]).toEqual(3 - 12);
    });

    it('Donne un score courrant de 28 à un joueur qui a les cartes 3, 4 et 35 dans sa pile et 12 jetons:', () => {
      history.push({ type: ActionType.TAKE });
      history.push({ type: ActionType.DRAW, payload: 4 });
      history.push({ type: ActionType.TAKE });
      board = new Board(initState, history);
      expect(board.getScores().find((s) => s[0] === 'Joueur2')[1]).toEqual(3 + 35 - 12);
    });
  });

  describe('interface MCTS:', () => {
    it('Renvoi des actions de jeu possibles si une carte est visible (et pas des tirages)', () => {
      const actions = [ActionType.PAY, ActionType.TAKE];
      const moves = board.getPossibleMoves();
      (moves as IGameAction[]).forEach((move) => expect(actions).toContain(move.type));
    });

    it('Renvoi des tirages possibles si pas de carte visible et deck non vide (et pas des actions de jeu)', () => {
      history.push({ type: ActionType.TAKE });
      board = new Board(initState, history);
      const moves = board.getPossibleMoves();
      (moves as IDraw[]).forEach((move) => {
        expect(move.type).toEqual(ActionType.DRAW);
        expect(move.payload).toEqual(jasmine.any(Number));
      } );
    });

    it('Renvoi les 2 actions possibles si le joueur actif a des jetons et une carte est visible', () => {
      const moves = (board.getPossibleMoves() as IGameAction[]).map((m) => m.type);
      expect(moves.length).toEqual(2);
      expect(moves).toContain(ActionType.TAKE);
      expect(moves).toContain(ActionType.PAY);
    });

    it('Renvoi l\'action possible TAKE si le joueur actif n\'a pas de jeton (et une carte est visible)', () => {
      initState.visibleCard = 35;
      initState.visibleTokens = initState.players[0].hiddenTokens;
      initState.players[0].hiddenTokens = 0;
      board = new Board(initState, []);
      const moves = board.getPossibleMoves();
      expect(board.getPossibleMoves()).toEqual([{ type: ActionType.TAKE }]);
    });

    it('Renvoie toutes les cartes sauf celles déjà visibles quand on demande les tirages possibles', () => {
      history.push({ type: ActionType.TAKE });
      history.push({ type: ActionType.DRAW, payload: 4 });
      history.push({ type: ActionType.TAKE });
      board = new Board(initState, history);
      const draws = (board.getPossibleMoves() as IDraw[]).map((m) => m.payload);
      expect(draws).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]);
    });

    it('Ne renvoie rien si le deck est vide quand on demande les tirages possibles', () => {
      initState.deckSize = 0;
      board = new Board(initState, []);
      expect(board.getState().visibleCard).toBeUndefined();
      expect(board.getPossibleMoves()).toEqual([]);
    });

    it('Renvoie le joueur actif', () => {
      expect(board.getCurrentPlayer()).toEqual('Joueur2');
    });

    it('Réalise un TAKE sur un performMove(Take)', () => {
      const takeSpy = spyOn(board, 'take');
      board.performMove({type: ActionType.TAKE});
      expect(takeSpy).toHaveBeenCalled();
    });

    it('Réalise un PAY et un SwitchActivePlayer sur un performMove(Pay)', () => {
      const paySpy = spyOn(board, 'pay');
      board.performMove({type: ActionType.PAY});
      expect(paySpy).toHaveBeenCalled();
    });

    it('Fait apparaitre la carte requise et retire une carte du deck sur un performMove(card)', () => {
      board = new Board(initState, []);
      const state = board.getState();
      board.performMove({type: ActionType.DRAW, payload: 10});
      const newState = board.getState();
      expect(newState.deckSize).toEqual(state.deckSize - 1);
      expect(newState.visibleCard).toEqual(10);
      expect(board.getHistory().pop()).toEqual({ type: ActionType.DRAW, payload: 10 });
    });

    it('Echoue a faire apparaitre une carte déjà révélée sur un performMove(card)', () => {
      board.take();
      expect(() => board.performMove({type: ActionType.DRAW, payload: 3})).toThrowError('CARD_ALREADY_ON_BOARD');
    });

    it('Echoue a faire apparaitre une carte s\'il y a déjà une carte visible sur un performMove(card)', () => {
      expect(() => board.performMove({type: ActionType.DRAW, payload: 10})).toThrowError('INVALID_ACTION');
    });

    it('Echoue a faire apparaitre une carte si le deck est vide sur un performMove(card)', () => {
      initState.deckSize = 0;
      board = new Board(initState, []);
      expect(() => board.performMove({type: ActionType.DRAW, payload: 10})).toThrowError('END_OF_GAME');
    });

    it('Ne renvoie rien si la partie n\'est pas terminée (deck non vide)', () => {
      expect(board.getState().deckSize).toBeGreaterThan(0);
      expect(board.getWinner()).toEqual(null);
    });

    it('Ne renvoie rien si la partie n\'est pas terminée (carte visible)', () => {
      initState.deckSize = 2;
      board = new Board(initState, history);
      expect(board.getState().deckSize).toEqual(0);
      expect(board.getState().visibleCard).not.toBeUndefined();
      expect(board.getWinner()).toEqual(null);
    });

    it('Renvoie le nom du joueur avec le plus petit score si la partie est pas terminée\n' +
    '(deck vide & pas de carte visible)', () => {
      initState.deckSize = 9;
      history = [
        { type: ActionType.DRAW, payload: 3 },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 4 },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 5 },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 6 },
        { type: ActionType.PAY },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 7 },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 8 },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 9 },
        { type: ActionType.PAY },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 10 },
        { type: ActionType.TAKE },
        { type: ActionType.DRAW, payload: 11 },
        { type: ActionType.TAKE },
      ];

      board = new Board(initState, history);
      expect(board.getWinner()).toEqual('Joueur1');
    });
  });
});
