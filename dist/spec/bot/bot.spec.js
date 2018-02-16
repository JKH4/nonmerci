"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("../../src/bot/bot");
const board_1 = require("../../src/core/board");
const game_1 = require("../../src/core/game");
describe('Gérer un Bot:', () => {
    it('Créé un bot avec une IA random', () => {
        const myBot = new bot_1.default(bot_1.BrainOptions.Random);
        expect(myBot).toEqual(jasmine.any(bot_1.default));
        expect(myBot.getBotInfo().brainType).toEqual(bot_1.BrainOptions.Random);
    });
    it('Propose une action de jeu en fonction d\'un état de plateau donné', () => {
        const myBot = new bot_1.default(bot_1.BrainOptions.Random);
        const board = new board_1.default({ players: ['Anna', 'Bob', 'Chris'] });
        const boardstate = board.getPlayerState();
        const proposedAction = myBot.proposeAction(boardstate);
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
            myBot.proposeAction(boardstate) === game_1.GameAction.Take
                ? nbTake++
                : nbPay++;
        }
        expect(nbTake + nbPay).toEqual(nbActions);
        expect(nbTake).toBeGreaterThan(30);
        expect(nbPay).toBeGreaterThan(30);
    });
    it('Propose toujours une action TAKE si le type d\'IA est Take', () => {
        const myBot = new bot_1.default(bot_1.BrainOptions.Take);
        const board = new board_1.default({ players: ['Anna', 'Bob', 'Chris'] });
        const boardstate = board.getPlayerState();
        let nbTake = 0;
        let nbPay = 0;
        const nbActions = 100;
        for (let i = 0; i < nbActions; i++) {
            myBot.proposeAction(boardstate) === game_1.GameAction.Take
                ? nbTake++
                : nbPay++;
        }
        expect(nbTake).toEqual(nbActions);
        expect(nbPay).toEqual(0);
    });
});
//# sourceMappingURL=bot.spec.js.map