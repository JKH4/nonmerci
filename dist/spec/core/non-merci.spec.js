"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const non_merci_1 = require("../../src/core/non-merci");
const game_1 = require("../../src/core/game");
// **************************************************************************************
describe('Gérer une partie:', () => {
    let nm;
    beforeEach(() => {
        nm = new non_merci_1.default();
    });
    it('Crée une nouvelle partie de NonMerci:', () => {
        const game = nm.createNewGame();
        expect(game).toEqual(jasmine.any(game_1.default));
        expect(game.getStatus()).toEqual(game_1.GameStatus.Created);
        expect(game.getPlayers().length).toBe(3);
        expect(game.getPlayers()).toEqual(['Joueur1', 'Joueur2', 'Joueur3']);
    });
    it('Crée une nouvelle partie de NonMerci avec 3 joueur:', () => {
        const gameOptions = {
            players: ['Anna', 'Bob', 'Chris'],
        };
        const game = nm.createNewGame(gameOptions);
        expect(game.getPlayers().length).toBe(3);
        expect(game.getPlayers()).toEqual(['Anna', 'Bob', 'Chris']);
    });
    it('Crée une nouvelle partie de NonMerci avec 5 joueurs:', () => {
        const gameOptions = {
            players: ['Anna', 'Bob', 'Chris', 'David', 'Ed'],
        };
        const game = nm.createNewGame(gameOptions);
        expect(game.getPlayers().length).toBe(5);
        expect(game.getPlayers()).toEqual(['Anna', 'Bob', 'Chris', 'David', 'Ed']);
    });
    it('Refuse de créer une nouvelle partie de NonMerci avec seulement 2 joueurs:', () => {
        const gameOptions = {
            players: ['Anna', 'Bob'],
        };
        let failedNewGame;
        expect(() => failedNewGame = nm.createNewGame(gameOptions)).toThrowError('INVALID_NUMBER_OF_PLAYERS');
        expect(failedNewGame).toBeUndefined();
    });
    it('Refuse de créer une nouvelle partie de NonMerci avec 6 joueurs:', () => {
        const gameOptions = {
            players: ['Anna', 'Bob', 'Chris', 'David', 'Ed', 'Franc'],
        };
        let failedNewGame;
        expect(() => failedNewGame = nm.createNewGame(gameOptions)).toThrowError('INVALID_NUMBER_OF_PLAYERS');
        expect(failedNewGame).toBeUndefined();
    });
    it('test main:', () => {
        nm.main();
    });
});
//# sourceMappingURL=non-merci.spec.js.map