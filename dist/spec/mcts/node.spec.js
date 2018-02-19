"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcts_1 = require("./../../src/mcts/mcts");
const node_1 = require("./../../src/mcts/node");
const board_1 = require("../../src/core/board");
const game_examples_1 = require("./game-examples");
describe('Expectiminimax:', () => {
    it('Construit par défaut un noeud de type Decision', () => {
        const game = new game_examples_1.SingleCellGame();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts);
        expect(node.isDecisionNode).toBeTruthy();
    });
    it('Construit par un noeud de type Tirage si précisé', () => {
        const game = new game_examples_1.SingleCellGame();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts, false);
        expect(node.isDecisionNode).toBeFalsy();
    });
    it('Construit par un noeud de type Decision si précisé', () => {
        const game = new game_examples_1.SingleCellGame();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts, true);
        expect(node.isDecisionNode).toBeTruthy();
    });
    it('Récupère les possibleMoves pour générer les noeuds fils si on est dans un noeud Decision', () => {
        const game = new game_examples_1.SingleCellGame();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts, true);
        const moveSpy = spyOn(node.game, 'getPossibleMoves');
        node.getChildren();
        expect(moveSpy).toHaveBeenCalled();
    });
    it('Récupère les possibleDraws pour générer les noeuds fils si on est dans un noeud Tirage', () => {
        const game = new game_examples_1.SingleCellGame();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts, false);
        const isDrawSpy = spyOn(node.game, 'isCurrentNodeADecisionNode').and.returnValue(false);
        const moveSpy = spyOn(node.game, 'getPossibleDraws');
        node.getChildren();
        expect(moveSpy).toHaveBeenCalled();
    });
    it('Construit le noeud via un performDraw si on est dans un noeud Decision', () => {
        const fullBoardState = {
            activePlayer: 'Joueur2',
            board: {
                deck: [3, 4, 5],
                playerCards: [
                    { name: 'Joueur1', cards: [6, 7] },
                    { name: 'Joueur2', cards: [8, 9] },
                    { name: 'Joueur3', cards: [10, 11] },
                ],
                visibleCard: undefined,
                visibleTokens: 4,
            },
            playerTokens: [
                { name: 'Joueur1', hiddenTokens: 11 },
                { name: 'Joueur2', hiddenTokens: 7 },
                { name: 'Joueur3', hiddenTokens: 11 },
            ],
            turn: 30,
        };
        const game = new board_1.default({ fullBoardState });
        const mcts = new mcts_1.default(game);
        // console.log(game.getState());
        const draw = game.getPossibleDraws()[0];
        // console.log(draw);
        const node = new node_1.default(game, null, draw, 0, mcts, true);
        expect(node.isDecisionNode).toBeTruthy();
        const drawSpy = spyOn(node.game, 'performDraw');
        node.getChildren();
        expect(drawSpy).toHaveBeenCalled();
    });
    it('Construit le noeud via un performMove si on est dans un noeud Tirage', () => {
        const game = new board_1.default();
        const mcts = new mcts_1.default(game);
        const draw = game.getPossibleDraws()[0];
        const node = new node_1.default(game, null, draw, 0, mcts, false);
        expect(node.isDecisionNode).toBeFalsy();
        const moveSpy = spyOn(node.game, 'performMove');
        node.getChildren();
        expect(moveSpy).toHaveBeenCalled();
    });
    it('Génère des children de type Décision si le noeud courant est un noeud de Decision\n'
        + 'et jeu n\'est pas de type Expectiminimax', () => {
        const game = new game_examples_1.SingleCellGame();
        // expect(game.isExpectiminimax()).toBeFalsy();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts);
        expect(node.isDecisionNode).toBeTruthy();
        const children = node.getChildren();
        expect(children.length).toBeGreaterThan(0);
        children.forEach((n) => expect(n.isDecisionNode).toBeTruthy());
    });
    // tslint:disable-next-line:max-line-length
    it('Génère des children de type Tirage si le prochain noeud doit être un noeud de Decision\n'
        + ' et jeu est de type Expectiminimax', () => {
        const game = new board_1.default();
        // expect(game.isExpectiminimax()).toBeTruthy();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts);
        expect(node.isDecisionNode).toBeTruthy();
        const children = node.getChildren();
        expect(children.length).toBeGreaterThan(0);
        children.forEach((n) => {
            expect(n.isDecisionNode).toEqual(game.isNextNodeADecisionNode(n.move));
        });
    });
});
//# sourceMappingURL=node.spec.js.map