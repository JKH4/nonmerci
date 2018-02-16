"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("../../src/bot/bot");
const board_1 = require("../../src/core/board");
const game_1 = require("../../src/core/game");
describe('Gérer un Bot:', () => {
    describe('Bot Random', () => {
        it('Créé un bot avec une IA random', () => {
            const myBot = new bot_1.default(bot_1.BrainOptions.Random);
            expect(myBot).toEqual(jasmine.any(bot_1.default));
            expect(myBot.getBotInfo().brainType).toEqual(bot_1.BrainOptions.Random);
        });
        it('Propose une action de jeu en fonction d\'un état de plateau donné', () => {
            const myBot = new bot_1.default(bot_1.BrainOptions.Random);
            const board = new board_1.default({ players: ['Anna', 'Bob', 'Chris'] });
            const boardstate = board.getPlayerState();
            const proposedAction = myBot.proposeAction(board);
            expect(game_1.GameAction[proposedAction]).toEqual(proposedAction);
        });
        it('Propose une action aléatoire si le type d\'IA est random', () => {
            const myBot = new bot_1.default(bot_1.BrainOptions.Random);
            const board = new board_1.default({ players: ['Anna', 'Bob', 'Chris'] });
            const boardstate = board.getPlayerState();
            let nbTake = 0;
            let nbPay = 0;
            const nbActions = 100;
            for (let i = 0; i < nbActions; i++) {
                myBot.proposeAction(board) === game_1.GameAction.Take
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
            const myBot = new bot_1.default(bot_1.BrainOptions.Take);
            const board = new board_1.default({ players: ['Anna', 'Bob', 'Chris'] });
            const boardstate = board.getPlayerState();
            let nbTake = 0;
            let nbPay = 0;
            const nbActions = 100;
            for (let i = 0; i < nbActions; i++) {
                myBot.proposeAction(board) === game_1.GameAction.Take
                    ? nbTake++
                    : nbPay++;
            }
            expect(nbTake).toEqual(nbActions);
            expect(nbPay).toEqual(0);
        });
    });
    describe('Bot MCTS', () => {
        let myBot;
        beforeEach(() => {
            myBot = new bot_1.default(bot_1.BrainOptions.Mcts1);
        });
        it('Créé un bot avec une IA MCTS1', () => {
            expect(myBot).toEqual(jasmine.any(bot_1.default));
            expect(myBot.getBotInfo().brainType).toEqual(bot_1.BrainOptions.Mcts1);
        });
        it('Ne propose pas d\'action si le jeu est fini', () => {
            const fullBoardState = {
                activePlayer: 'Joueur1',
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
                turn: 2,
            };
            const board = new board_1.default({ fullBoardState });
            const proposedAction = myBot.proposeAction(board);
            expect(proposedAction).toEqual([]);
        });
    });
});
//# sourceMappingURL=bot.spec.js.map