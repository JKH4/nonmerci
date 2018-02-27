import Bot, { BrainOptions } from '../../src/bot/bot';
import Board from '../../src/core/board';
import BoardHelper, { ActionType, IBoardState, IDraw, IGameAction } from '../../src/core/board-helper';
// import { GameAction } from '../../src/core/game';

describe('Gérer un Bot:', () => {

  describe('Bot Random', () => {
    it('Créé un bot avec une IA random', () => {
      const myBot = new Bot(BrainOptions.Random);
      expect(myBot).toEqual(jasmine.any(Bot));
      expect(myBot.getBotInfo().brainType).toEqual(BrainOptions.Random);
    });
    it('Propose une action de jeu en fonction d\'un état de plateau donné', () => {
      const myBot = new Bot(BrainOptions.Random);
      const initState = BoardHelper.initBoardState({playerList: ['Anna', 'Bob', 'Chris']});
      const board = new Board(initState, []);
      const boardstate = board.getState();
      const proposedAction = myBot.proposeAction(board);
      expect(ActionType[proposedAction.type]).toEqual(proposedAction.type);
    });
    it('Propose une action aléatoire si le type d\'IA est random', () => {
      const myBot = new Bot(BrainOptions.Random);
      const initState = BoardHelper.initBoardState({playerList: ['Anna', 'Bob', 'Chris']});
      const board = new Board(initState, []);
      const boardstate = board.getState();
      let nbTake = 0;
      let nbPay = 0;
      const nbActions = 100;
      for (let i = 0; i < nbActions; i++) {
        myBot.proposeAction(board).type === ActionType.TAKE
          ? nbTake++
          : nbPay++;
      }
      expect(nbTake + nbPay).toEqual(nbActions);
      expect(nbTake).toBeGreaterThan(30);
      expect(nbPay).toBeGreaterThan(30);
    });
  });

  describe('Bot TAKE', () => {
    it('Propose toujours une action TAKE si le type d\'IA est Take', () => {
      const myBot = new Bot(BrainOptions.Take);
      const initState = BoardHelper.initBoardState({playerList: ['Anna', 'Bob', 'Chris']});
      const board = new Board(initState, []);
      const boardstate = board.getState();
      let nbTake = 0;
      let nbPay = 0;
      const nbActions = 100;
      for (let i = 0; i < nbActions; i++) {
        myBot.proposeAction(board).type === ActionType.TAKE
          ? nbTake++
          : nbPay++;
      }
      expect(nbTake).toEqual(nbActions);
      expect(nbPay).toEqual(0);
    });
  });

  describe('Bot MCTS', () => {
    let myBot: Bot;
    beforeEach(() => {
      myBot = new Bot(BrainOptions.Mcts1);
    });

    it('Créé un bot avec une IA MCTS1', () => {
      expect(myBot).toEqual(jasmine.any(Bot));
      expect(myBot.getBotInfo().brainType).toEqual(BrainOptions.Mcts1);
    });

    it('Renvoi une erreur si on demande une action alors que le jeu est fini', () => {
      const initState: IBoardState = {
        activePlayer: 'Joueur1',
        deckSize: 0,
        players: [
          { name: 'Joueur1', cards: [], hiddenTokens: 11 },
          { name: 'Joueur2', cards: [], hiddenTokens: 11 },
          { name: 'Joueur3', cards: [], hiddenTokens: 11 },
        ],
        turn: 2,
        visibleCard: undefined,
        visibleTokens: 0,
      };

      // const initState = BoardHelper.initBoardState({playerList: ['Anna', 'Bob', 'Chris']});
      const board = new Board(initState, []);
      const boardstate = board.getState();
      expect(() => myBot.proposeAction(board)).toThrowError('NO_NEXT_MOVE');
      // const proposedAction = myBot.proposeAction(board);
      // expect(proposedAction).toEqual(undefined);
    });

    it('Propose l\'action PAY si le joueur actif a plein de jetons et que la carte est grosse', () => {
      const initState: IBoardState = {
        activePlayer: 'Joueur1',
        deckSize: 0,
        players: [
          { name: 'Joueur1', cards: [], hiddenTokens: 11 },
          { name: 'Joueur2', cards: [], hiddenTokens: 9 },
          { name: 'Joueur3', cards: [], hiddenTokens: 9 },
        ],
        turn: 2,
        visibleCard: 35,
        visibleTokens: 4,
      };

      // const initState = BoardHelper.initBoardState({playerList: ['Anna', 'Bob', 'Chris']});
      const board = new Board(initState, []);
      const boardstate = board.getState();
      const proposedAction = myBot.proposeAction(board);
      // console.log(proposedAction);
      // const toto: IGameAction | IDraw = { type: ActionType.PAY };
      expect(proposedAction).toEqual({ type: ActionType.PAY });
    });

    it('Propose l\'action PAY si le joueur actif des jetons et la carte est plus grosse que les jetons', () => {
      // const fullBoardState: IBoardState = {
      //   activePlayer: 'Joueur1',
      //   board: {
      //     deck: [],
      //     playerCards: [
      //       { name: 'Joueur1', cards: [] },
      //       { name: 'Joueur2', cards: [] },
      //       { name: 'Joueur3', cards: [] },
      //     ],
      //     visibleCard: 3,
      //     visibleTokens: 1,
      //   },
      //   history: [],
      //   playerTokens: [
      //     { name: 'Joueur1', hiddenTokens: 1 },
      //     { name: 'Joueur2', hiddenTokens: 1 },
      //     { name: 'Joueur3', hiddenTokens: 1 },
      //   ],
      //   turn: 2,
      // };

      // const board = new Board({ fullBoardState });
      const initState: IBoardState = {
        activePlayer: 'Joueur1',
        deckSize: 0,
        players: [
          { name: 'Joueur1', cards: [], hiddenTokens: 10 },
          { name: 'Joueur2', cards: [], hiddenTokens: 10 },
          { name: 'Joueur3', cards: [], hiddenTokens: 10 },
        ],
        turn: 2,
        visibleCard: 35,
        visibleTokens: 3,
      };

      // const initState = BoardHelper.initBoardState({playerList: ['Anna', 'Bob', 'Chris']});
      const board = new Board(initState, []);
      const boardstate = board.getState();
      const proposedAction = myBot.proposeAction(board);
      expect(proposedAction.type).toEqual(ActionType.PAY);
    });

    it('Propose l\'action TAKE si le joueur actif a peu de jetons et que la carte est petite', () => {
      // const fullBoardState: IBoardState = {
      //   activePlayer: 'Joueur1',
      //   board: {
      //     deck: [],
      //     playerCards: [
      //       { name: 'Joueur1', cards: [] },
      //       { name: 'Joueur2', cards: [] },
      //       { name: 'Joueur3', cards: [] },
      //     ],
      //     visibleCard: 3,
      //     visibleTokens: 30,
      //   },
      //   history: [],
      //   playerTokens: [
      //     { name: 'Joueur1', hiddenTokens: 1 },
      //     { name: 'Joueur2', hiddenTokens: 1 },
      //     { name: 'Joueur3', hiddenTokens: 1 },
      //   ],
      //   turn: 2,
      // };

      // const board = new Board({ fullBoardState });
      const initState: IBoardState = {
        activePlayer: 'Joueur1',
        deckSize: 0,
        players: [
          { name: 'Joueur1', cards: [], hiddenTokens: 1 },
          { name: 'Joueur2', cards: [], hiddenTokens: 1 },
          { name: 'Joueur3', cards: [], hiddenTokens: 1 },
        ],
        turn: 2,
        visibleCard: 3,
        visibleTokens: 30,
      };

      // const initState = BoardHelper.initBoardState({playerList: ['Anna', 'Bob', 'Chris']});
      const board = new Board(initState, []);
      const boardstate = board.getState();
      const proposedAction = myBot.proposeAction(board);
      expect(proposedAction.type).toEqual(ActionType.TAKE);
    });
  });
});
