"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_helper_1 = require("../../src/core/board-helper");
describe('Fonctions utilitaires du Plateau:', () => {
    let defaultBoardState;
    beforeEach(() => { defaultBoardState = board_helper_1.default.getDefaultBoardState(); });
    describe('Créer un IBoardState', () => {
        it('Récupère le boardState par défaut', () => {
            expect(defaultBoardState).toEqual({
                activePlayer: 'Joueur1',
                deckSize: 24,
                players: [
                    { name: 'Joueur1', cards: [], hiddenTokens: 11 },
                    { name: 'Joueur2', cards: [], hiddenTokens: 11 },
                    { name: 'Joueur3', cards: [], hiddenTokens: 11 },
                ],
                turn: 0,
                visibleCard: undefined,
                visibleTokens: 0,
            });
        });
        it('Ne modifie pas le boardState par défaut', () => {
            defaultBoardState.players[0].name = 'toto';
            expect(defaultBoardState).not.toEqual(board_helper_1.default.getDefaultBoardState());
        });
        it('Créé un IBoardState sans aucune option', () => {
            expect(board_helper_1.default.initBoardState()).toEqual(defaultBoardState);
        });
        it('Créé un IBoardState a partir d\'options simples (playerList)', () => {
            const options = { playerList: ['Anna', 'Bob', 'Chris'] };
            const boardState = board_helper_1.default.initBoardState(options);
            expect(boardState.players.map((p) => p.name)).toEqual(['Anna', 'Bob', 'Chris']);
        });
        it('Echoue à créer un IBoardState a partir d\'options invalides (playerList < 3)', () => {
            const options = { playerList: ['Anna', 'Bob'] };
            expect(() => board_helper_1.default.initBoardState(options)).toThrowError('INVALID_PLAYER_LIST');
        });
        it('Echoue à créer un IBoardState a partir d\'options invalides (playerList > 5)', () => {
            const options = { playerList: ['Anna', 'Bob'] };
            expect(() => board_helper_1.default.initBoardState(options)).toThrowError('INVALID_PLAYER_LIST');
        });
        it('Echoue à créer un IBoardState a partir d\'options invalides (empty name)', () => {
            const options = { playerList: ['Anna', 'Bob', ''] };
            expect(() => board_helper_1.default.initBoardState(options)).toThrowError('INVALID_PLAYER_LIST');
        });
        it('Créé un IBoardState a partir d\'options simples (deckSize)', () => {
            const options = { deckSize: 12 };
            const boardState = board_helper_1.default.initBoardState(options);
            expect(boardState.deckSize).toEqual(12);
        });
        it('Echoue à créer un IBoardState a partir d\'options invalides (deckSize < 0)', () => {
            const options = { deckSize: -1 };
            expect(() => board_helper_1.default.initBoardState(options)).toThrowError('INVALID_DECK_SIZE');
        });
        it('Echoue à créer un IBoardState a partir d\'options invalides (deckSize flottant)', () => {
            const options = { deckSize: 1.5 };
            expect(() => board_helper_1.default.initBoardState(options)).toThrowError('INVALID_DECK_SIZE');
        });
    });
    describe('Lister toutes les cartes du plateau:', () => {
        let boardState;
        beforeEach(() => {
            boardState = {
                activePlayer: 'Joueur1',
                deckSize: 24,
                players: [
                    { name: 'Joueur1', cards: [3, 4, 5], hiddenTokens: 11 },
                    { name: 'Joueur2', cards: [6, 7], hiddenTokens: 11 },
                    { name: 'Joueur3', cards: [10, 12], hiddenTokens: 11 },
                ],
                turn: 0,
                visibleCard: 35,
                visibleTokens: 0,
            };
        });
        it('OK Full', () => {
            expect(board_helper_1.default.listVisibleCards(boardState)).toEqual([35, 3, 4, 5, 6, 7, 10, 12]);
        });
        it('OK avec visibleCard undefined', () => {
            boardState.visibleCard = undefined;
            expect(board_helper_1.default.listVisibleCards(boardState)).toEqual([3, 4, 5, 6, 7, 10, 12]);
        });
    });
    describe('Lister les cartes disponibles au tirage:', () => {
        let boardState;
        beforeEach(() => {
            boardState = {
                activePlayer: 'Joueur1',
                deckSize: 24,
                players: [
                    { name: 'Joueur1', cards: [3, 4, 5], hiddenTokens: 11 },
                    { name: 'Joueur2', cards: [6, 7], hiddenTokens: 11 },
                    { name: 'Joueur3', cards: [10, 12], hiddenTokens: 11 },
                ],
                turn: 0,
                visibleCard: 35,
                visibleTokens: 0,
            };
        });
        it('OK', () => {
            expect(board_helper_1.default.listAvailableCards(boardState))
                .toEqual([8, 9, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]);
        });
        it('OK avec visibleCard undefined', () => {
            boardState.visibleCard = undefined;
            expect(board_helper_1.default.listAvailableCards(boardState))
                .toEqual([8, 9, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]);
        });
    });
    describe('Valider un IBoardState:', () => {
        let boardState;
        beforeEach(() => {
            boardState = {
                activePlayer: 'Joueur1',
                deckSize: 24,
                players: [
                    { name: 'Joueur1', cards: [3, 4, 5], hiddenTokens: 10 },
                    { name: 'Joueur2', cards: [6, 7], hiddenTokens: 9 },
                    { name: 'Joueur3', cards: [10, 12], hiddenTokens: 11 },
                ],
                turn: 0,
                visibleCard: 35,
                visibleTokens: 3,
            };
        });
        it('OK', () => { expect(() => board_helper_1.default.validateBoardState(boardState)).not.toThrowError(); });
        it('ACTIVE_PLAYER_NOT_IN_PLAYER_LIST', () => {
            boardState.activePlayer = 'toto';
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('ACTIVE_PLAYER_NOT_IN_PLAYER_LIST');
        });
        it('INVALID_NUMBER_OF_PLAYER < 3', () => {
            boardState.players.pop();
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('INVALID_NUMBER_OF_PLAYER');
        });
        it('INVALID_NUMBER_OF_PLAYER > 5', () => {
            boardState.players.push({ name: 'j4', cards: [], hiddenTokens: 11 });
            boardState.players.push({ name: 'j5', cards: [], hiddenTokens: 11 });
            boardState.players.push({ name: 'j6', cards: [], hiddenTokens: 11 });
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('INVALID_NUMBER_OF_PLAYER');
        });
        it('INVALID_CARD_VALUE', () => {
            boardState.visibleCard = 1;
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('INVALID_CARD_VALUE');
        });
        it('DUPLICATED_CARDS', () => {
            boardState.visibleCard = 3;
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('DUPLICATED_CARDS');
        });
        it('INVALID_TOTAL_TOKENS', () => {
            boardState.visibleTokens = 1;
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('INVALID_TOTAL_TOKENS');
        });
        it('VISIBLE_TOKENS_WITHOUT_VISIBLE_CARD', () => {
            boardState.visibleCard = undefined;
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('VISIBLE_TOKENS_WITHOUT_VISIBLE_CARD');
        });
        it('INVALID_TURN negative', () => {
            boardState.turn = -1;
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('INVALID_TURN');
        });
        it('INVALID_TURN not integer', () => {
            boardState.turn = 2.5;
            expect(() => board_helper_1.default.validateBoardState(boardState)).toThrowError('INVALID_TURN');
        });
    });
    describe('BoardHelper.validateHistory:', () => {
        let history;
        beforeEach(() => {
            history = [
                { type: board_helper_1.ActionType.DRAW, payload: 3 },
                { type: board_helper_1.ActionType.PAY },
                { type: board_helper_1.ActionType.TAKE },
            ];
        });
        it('OK', () => {
            expect(() => board_helper_1.default.validateHistory(history)).not.toThrowError();
        });
        it('TAKE_SHOULD_BE_FOLLOWED_BY_DRAW', () => {
            history.push({ type: board_helper_1.ActionType.TAKE });
            history.push({ type: board_helper_1.ActionType.TAKE });
            expect(() => board_helper_1.default.validateHistory(history)).toThrowError('TAKE_SHOULD_BE_FOLLOWED_BY_DRAW');
        });
        it('DRAW_SHOULD_BE_FOLLOWED_BY_GAMEACTION', () => {
            history.push({ type: board_helper_1.ActionType.DRAW, payload: 4 });
            history.push({ type: board_helper_1.ActionType.DRAW, payload: 5 });
            expect(() => board_helper_1.default.validateHistory(history)).toThrowError('DRAW_SHOULD_BE_FOLLOWED_BY_GAMEACTION');
        });
        it('PAY_SHOULD_BE_FOLLOWED_BY_GAMEACTION', () => {
            history.push({ type: board_helper_1.ActionType.DRAW, payload: 4 });
            history.push({ type: board_helper_1.ActionType.PAY });
            history.push({ type: board_helper_1.ActionType.DRAW, payload: 5 });
            expect(() => board_helper_1.default.validateHistory(history)).toThrowError('PAY_SHOULD_BE_FOLLOWED_BY_GAMEACTION');
        });
        it('INVALID_CARD_VALUE', () => {
            history.push({ type: board_helper_1.ActionType.DRAW, payload: 2 });
            expect(() => board_helper_1.default.validateHistory(history)).toThrowError('INVALID_CARD_VALUE');
        });
        it('DUPLICATE_DRAWS', () => {
            history.push({ type: board_helper_1.ActionType.DRAW, payload: 3 });
            expect(() => board_helper_1.default.validateHistory(history)).toThrowError('DUPLICATE_DRAWS');
        });
    });
    describe('cloneState', () => {
        let state;
        let clone;
        beforeEach(() => {
            state = {
                activePlayer: 'Joueur1',
                deckSize: 24,
                players: [
                    { name: 'Joueur1', cards: [3, 4, 5], hiddenTokens: 10 },
                    { name: 'Joueur2', cards: [6, 7], hiddenTokens: 9 },
                    { name: 'Joueur3', cards: [10, 12], hiddenTokens: 11 },
                ],
                turn: 0,
                visibleCard: 35,
                visibleTokens: 3,
            };
            clone = board_helper_1.default.cloneState(state);
        });
        it('Créé un clone d\'un boardState', () => {
            expect(clone).toEqual(state);
            state.players[0].name = 'toto';
            expect(clone).not.toEqual(state);
        });
    });
    // describe('buildCurrentState', () => {
    //   it('Construit un IBoardState a partir d\'un initState et d\'un historique', () => {
    //     const initState = {
    //       activePlayer: 'Joueur1',
    //       deckSize: 24,
    //       players: [
    //         {name: 'Joueur1', cards: [3, 4, 5], hiddenTokens: 10},
    //         {name: 'Joueur2', cards: [6, 7], hiddenTokens: 9},
    //         {name: 'Joueur3', cards: [10, 12], hiddenTokens: 11},
    //       ],
    //       turn: 0,
    //       visibleCard: 35,
    //       visibleTokens: 3,
    //     };
    //     const history: BoardHistory = [
    //       { type: ActionType.PAY },
    //       { type: ActionType.TAKE },
    //       { type: ActionType.DRAW, payload: 34 },
    //     ];
    //     expect(BoardHelper.buildCurrentState(initState, history)).toEqual({
    //       activePlayer: 'Joueur1',
    //       deckSize: 24,
    //       players: [
    //         {name: 'Joueur1', cards: [3, 4, 5], hiddenTokens: 9},
    //         {name: 'Joueur2', cards: [6, 7, 35], hiddenTokens: 13},
    //         {name: 'Joueur3', cards: [10, 12], hiddenTokens: 11},
    //       ],
    //       turn: 0,
    //       visibleCard: 34,
    //       visibleTokens: 0,
    //     });
    //   });
    // });
});
//# sourceMappingURL=board-helper.spec.js.map