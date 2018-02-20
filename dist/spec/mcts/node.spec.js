"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcts_1 = require("./../../src/mcts/mcts");
const node_1 = require("./../../src/mcts/node");
const game_examples_1 = require("./game-examples");
describe('Expectiminimax:', () => {
    it('Construit par défaut un noeud de type Decision', () => {
        const game = new game_examples_1.SingleCellGame();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts);
        expect(node.game.isDecisionNode()).toBeTruthy();
    });
    it('Récupère les possibleMoves pour générer les noeuds fils si on est dans un noeud Decision', () => {
        const game = new game_examples_1.SingleCellGame();
        const mcts = new mcts_1.default(game);
        const node = new node_1.default(game, null, null, 0, mcts);
        const moveSpy = spyOn(node.game, 'getPossibleMoves');
        node.getChildren();
        expect(moveSpy).toHaveBeenCalled();
    });
    // it('Récupère les possibleDraws pour générer les noeuds fils si on est dans un noeud Tirage', () => {
    //   const game = new SingleCellGame();
    //   const mcts = new MCTS(game);
    //   const node = new Node(game, null, null, 0, mcts);
    //   const isDrawSpy = spyOn(node.game, 'isDecisionNode').and.returnValue(false);
    //   const moveSpy = spyOn(node.game, 'getPossibleDraws');
    //   node.getChildren();
    //   expect(moveSpy).toHaveBeenCalled();
    // });
    // it('Construit le noeud via un performDraw si on est dans un noeud Decision', () => {
    //   const fullBoardState: IFullBoardState = {
    //     activePlayer: 'Joueur2',
    //     board: {
    //       deck: [3, 4, 5],
    //       playerCards: [
    //         { name: 'Joueur1', cards: [6, 7] },
    //         { name: 'Joueur2', cards: [8, 9] },
    //         { name: 'Joueur3', cards: [10, 11] },
    //       ],
    //       visibleCard: undefined,
    //       visibleTokens: 4,
    //     },
    //     playerTokens: [
    //       { name: 'Joueur1', hiddenTokens: 11 },
    //       { name: 'Joueur2', hiddenTokens: 7 },
    //       { name: 'Joueur3', hiddenTokens: 11 },
    //     ],
    //     turn: 30,
    //   };
    //   const game = new Board({fullBoardState});
    //   const mcts = new MCTS(game);
    //   const draw = game.getPossibleDraws()[0];
    //   const node = new Node(game, null, draw, 0, mcts);
    //   const drawSpy = spyOn(node.game, 'performDraw');
    //   node.getChildren();
    //   expect(drawSpy).toHaveBeenCalled();
    // });
    // it('Construit le noeud via un performMove si on est dans un noeud Tirage', () => {
    //   const game = new Board();
    //   const mcts = new MCTS(game);
    //   const draw = game.getPossibleDraws()[0];
    //   const node = new Node(game, null, draw, 0, mcts);
    //   const moveSpy = spyOn(node.game, 'performMove');
    //   node.getChildren();
    //   expect(moveSpy).toHaveBeenCalled();
    // });
});
//# sourceMappingURL=node.spec.js.map