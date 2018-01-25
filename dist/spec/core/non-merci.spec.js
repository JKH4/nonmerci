"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const non_merci_1 = require("../../src/non-merci");
const board_state_1 = require("../../src/board-state");
const game_1 = require("../../src/game");
// ***************************************************
describe('Gérer une partie:', () => {
    let nm;
    beforeEach(() => {
        nm = new non_merci_1.default();
    });
    it('Crée une nouvelle partie de NonMerci:', () => {
        const newGame = nm.createNewGame();
        expect(newGame instanceof game_1.default).toBeTruthy();
        expect(newGame.getStatus()).toEqual(game_1.GameStatus.Created);
    });
    it('Crée une nouvelle partie de NonMerci avec 3 joueur:', () => {
        const gameOptions = {
            players: ['Anna', 'Bob', 'Chris'],
        };
        const newGame = nm.createNewGame(gameOptions);
        expect(newGame.getPlayers().length).toBe(3);
        expect(newGame.getPlayers()).toEqual(['Anna', 'Bob', 'Chris']);
    });
    it('Crée une nouvelle partie de NonMerci avec 5 joueurs:', () => {
        const gameOptions = {
            players: ['Anna', 'Bob', 'Chris', 'David', 'Ed'],
        };
        const newGame = nm.createNewGame(gameOptions);
        expect(newGame.getPlayers().length).toBe(5);
        expect(newGame.getPlayers()).toEqual(['Anna', 'Bob', 'Chris', 'David', 'Ed']);
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
});
// ***************************************************
describe('Jouer une partie:', () => {
    let newGame;
    beforeEach(() => {
        newGame = new non_merci_1.default().createNewGame();
    });
    it('Démarre une partie:', () => {
        expect(newGame.start()).toBeTruthy();
        expect(newGame.getStatus()).toBe(game_1.GameStatus.OnGoing);
    });
    it('Refuse de démarrer une partie si elle est déjà démarrée:', () => {
        newGame.start();
        expect(newGame.getStatus()).toBe(game_1.GameStatus.OnGoing);
        expect(newGame.start()).toBeFalsy();
    });
    it('Refuse de démarrer une partie si elle est déjà terminée:', () => {
        newGame.start();
        newGame.terminate();
        expect(newGame.getStatus()).toBe(game_1.GameStatus.Terminated);
        expect(newGame.start()).toBeFalsy();
    });
    it('Termine une partie:', () => {
        newGame.start();
        expect(newGame.terminate()).toBeTruthy();
        expect(newGame.getStatus()).toBe(game_1.GameStatus.Terminated);
    });
    it('Refuse de terminer une partie si elle n\'est pas en cours:', () => {
        expect(newGame.getStatus()).toBe(game_1.GameStatus.Created);
        expect(newGame.terminate()).toBeFalsy();
        newGame.start();
        newGame.terminate();
        expect(newGame.getStatus()).toBe(game_1.GameStatus.Terminated);
        expect(newGame.terminate()).toBeFalsy();
    });
    it('Joue le prochain tour d\'une partie en cours:', () => {
        newGame.start();
        const turn = newGame.getCurrentTurn();
        expect(newGame.playNextTurn()).toBeTruthy();
        expect(newGame.getCurrentTurn()).toEqual(turn + 1);
    });
    it('Refuse de jouer le prochain tour d\'une partie non démarré:', () => {
        expect(newGame.getCurrentTurn()).toBeUndefined();
        expect(newGame.playNextTurn()).toBeFalsy();
        expect(newGame.getCurrentTurn()).toBeUndefined();
    });
    it('Récupére l\'état du plateau de jeu:', () => {
        newGame.start();
        expect(newGame.getBoardState() instanceof board_state_1.default).toBeTruthy();
    });
    it('Echoue à récupérer l\'état du plateau de jeu si la partie n\'est pas en cours:', () => {
        expect(newGame.getStatus()).toBe(game_1.GameStatus.Created);
        expect(newGame.getBoardState() instanceof board_state_1.default).toBeFalsy();
        newGame.start();
        newGame.terminate();
        expect(newGame.getBoardState() instanceof board_state_1.default).toBeFalsy();
    });
});
//# sourceMappingURL=non-merci.spec.js.map