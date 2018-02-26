import {
  extractAllCardValues,
  HistoryLineType,
  IFullBoardState,
  IHistoryInit,
  IPlayerBoardState,
  validateCurrentStateConsistency,
  validateHistoryConsistency,
} from '../../src/core/board';

import { GameAction } from '../../src/core/game';

describe('Fonctions utilitaires du Plateau:', () => {
  let currentState;
  let fullBoardState: IFullBoardState;

  beforeEach(() => {
    currentState = {
      activePlayer: 'Bob',
      board: {
        deck: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        playerCards: [
          { name: 'Anna', cards: [3, 4, 5] },
          { name: 'Bob', cards: [6, 7] },
          { name: 'David', cards: [8, 9, 10, 34] },
        ],
        visibleCard: 35,
        visibleTokens: 3,
      },
      playerTokens: [
        { name: 'Anna', hiddenTokens: 10 },
        { name: 'Bob', hiddenTokens: 10 },
        { name: 'David', hiddenTokens: 10 },
      ],
      turn: 30,
    };
    fullBoardState = {
      ...JSON.parse(JSON.stringify(currentState)),
      history: [],
      history2: [
        { type: HistoryLineType.Init, payload: JSON.parse(JSON.stringify(currentState)) },
        // { type: HistoryLineType.GameAction, payload: GameAction.Take },
      ],
    };
  });
  describe('extractAllBoardCardValues:', () => {
    it('OK Full', () => {
      expect(extractAllCardValues(fullBoardState)).toEqual([
        fullBoardState.board.visibleCard,
        ...fullBoardState.board.deck,
        ...fullBoardState.board.playerCards[0].cards,
        ...fullBoardState.board.playerCards[1].cards,
        ...fullBoardState.board.playerCards[2].cards,
      ]);
    });

    it('OK avec visibleCard undefined', () => {
      fullBoardState.board.visibleCard = undefined;
      expect(extractAllCardValues(fullBoardState)).toEqual([
        ...fullBoardState.board.deck,
        ...fullBoardState.board.playerCards[0].cards,
        ...fullBoardState.board.playerCards[1].cards,
        ...fullBoardState.board.playerCards[2].cards,
      ]);
    });
  });

  describe('validateCurrentStateConsistency:', () => {
    it('OK', () => {
      expect(() => validateCurrentStateConsistency(fullBoardState)).not.toThrowError();
    });
    it('ACTIVE_PLAYER_NOT_IN_PLAYER_LIST', () => {
      fullBoardState.activePlayer = 'toto';
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('ACTIVE_PLAYER_NOT_IN_PLAYER_LIST');
    });
    it('PLAYERCARDS_DONT_MATCH_PLAYERTOKENS', () => {
      fullBoardState.playerTokens[1].name = 'toto';
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('PLAYERCARDS_DONT_MATCH_PLAYERTOKENS');
    });
    it('INVALID_NUMBER_OF_PLAYER < 3', () => {
      fullBoardState.playerTokens.pop();
      fullBoardState.board.playerCards.pop();
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('INVALID_NUMBER_OF_PLAYER');
    });
    it('INVALID_NUMBER_OF_PLAYER > 5', () => {
      fullBoardState.playerTokens.push({name: 'j4', hiddenTokens: 11});
      fullBoardState.board.playerCards.push({name: 'j4', cards: []});
      fullBoardState.playerTokens.push({name: 'j5', hiddenTokens: 11});
      fullBoardState.board.playerCards.push({name: 'j5', cards: []});
      fullBoardState.playerTokens.push({name: 'j6', hiddenTokens: 11});
      fullBoardState.board.playerCards.push({name: 'j6', cards: []});
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('INVALID_NUMBER_OF_PLAYER');
    });
    it('INVALID_CARD_VALUE', () => {
      fullBoardState.board.visibleCard = 1;
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('INVALID_CARD_VALUE');
    });
    it('DUPLICATED_CARDS', () => {
      fullBoardState.board.visibleCard = 3;
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('DUPLICATED_CARDS');
    });
    it('INVALID_TOTAL_TOKENS', () => {
      fullBoardState.board.visibleTokens = 1;
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('INVALID_TOTAL_TOKENS');
    });
    it('VISIBLE_TOKENS_WITHOUT_VISIBLE_CARD', () => {
      fullBoardState.board.visibleCard = undefined;
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('VISIBLE_TOKENS_WITHOUT_VISIBLE_CARD');
    });
    it('INVALID_TURN negative', () => {
      fullBoardState.turn = -1;
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('INVALID_TURN');
    });
    it('INVALID_TURN not integer', () => {
      fullBoardState.turn = 2.5;
      expect(() => validateCurrentStateConsistency(fullBoardState)).toThrowError('INVALID_TURN');
    });
  });

  describe('validateHistoryConsistency:', () => {
    it('OK', () => {
      expect(() => validateHistoryConsistency(fullBoardState)).not.toThrowError();
    });
    it('NO_HISTORY_AVAILABLE', () => {
      fullBoardState.history2 = undefined;
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError('NO_HISTORY_AVAILABLE');
    });
    it('FIRST_HISTORY_LINE_SHOULD_BE_INIT', () => {
      fullBoardState.history2[0].type = HistoryLineType.Draw;
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError('FIRST_HISTORY_LINE_SHOULD_BE_INIT');
    });
    it('TAKE_SHOULD_BE_FOLLOWED_BY_DRAW', () => {
      fullBoardState.history2.push({type: HistoryLineType.GameAction, payload: GameAction.Take});
      fullBoardState.history2.push({type: HistoryLineType.GameAction, payload: GameAction.Take});
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError('TAKE_SHOULD_BE_FOLLOWED_BY_DRAW');
    });
    it('DRAW_SHOULD_BE_FOLLOWED_BY_GAMEACTION', () => {
      fullBoardState.history2.push({type: HistoryLineType.Draw, payload: 3});
      fullBoardState.history2.push({type: HistoryLineType.Draw, payload: 4});
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError('DRAW_SHOULD_BE_FOLLOWED_BY_GAMEACTION');
    });
    it('PAY_SHOULD_BE_FOLLOWED_BY_GAMEACTION', () => {
      fullBoardState.history2.push({type: HistoryLineType.GameAction, payload: GameAction.Pay});
      fullBoardState.history2.push({type: HistoryLineType.Draw, payload: 4});
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError('PAY_SHOULD_BE_FOLLOWED_BY_GAMEACTION');
    });
    it('Init payload should be a valid current state', () => {
      (fullBoardState.history2[0].payload as IHistoryInit).activePlayer = 'toto';
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError();
    });
    it('INVALID_CARD_VALUE', () => {
      fullBoardState.history2.push({type: HistoryLineType.Draw, payload: 2});
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError('INVALID_CARD_VALUE');
    });
    it('INIT_WITHOUT_VISIBLE_CARD_SHOULD_BE_FOLLOWED_BY_DRAW', () => {
      (fullBoardState.history2[0].payload as IHistoryInit).playerTokens[0].hiddenTokens +=
        (fullBoardState.history2[0].payload as IHistoryInit).board.visibleTokens;
      (fullBoardState.history2[0].payload as IHistoryInit).board.visibleTokens = 0;
      (fullBoardState.history2[0].payload as IHistoryInit).board.visibleCard = undefined;
      fullBoardState.history2.push({type: HistoryLineType.GameAction, payload: GameAction.Pay});
      expect(() => validateHistoryConsistency(fullBoardState))
        .toThrowError('INIT_WITHOUT_VISIBLE_CARD_SHOULD_BE_FOLLOWED_BY_DRAW');
    });
    it('DUPLICATE_DRAWS', () => {
      fullBoardState.history2.push({type: HistoryLineType.GameAction, payload: GameAction.Take});
      fullBoardState.history2.push({type: HistoryLineType.Draw, payload: 3});
      fullBoardState.history2.push({type: HistoryLineType.GameAction, payload: GameAction.Take});
      fullBoardState.history2.push({type: HistoryLineType.Draw, payload: 3});
      expect(() => validateHistoryConsistency(fullBoardState)).toThrowError('DUPLICATE_DRAWS');
    });
    xit('NOT_ENOUGH_TOKEN', () => {
      expect('to be implemented').toEqual('implemented');
    });
  });
});
