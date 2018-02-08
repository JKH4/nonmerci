"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_state_1 = require("./board-state");
/**
 * Error List:
 * - Error ('INVALID_NUMBER_OF_PLAYERS')
 * - Error ('INVALID_GAME_STATUS')
 * - Error ('END_OF_GAME')
 */
class Game {
    //#endregion Propriétés internes ------------------------------------------------------
    constructor(options) {
        this.defaultOptions = {
            players: ['Joueur1', 'Joueur2', 'Joueur3'],
        };
        //#region Getters #####################################################################
        this.getStatus = () => this.status;
        this.getPlayers = () => this.players;
        // public getCurrentTurn = (): number => this.currentTurn;
        this.getBoardState = () => this.currentBoardState;
        this.getScores = () => this.scores;
        // Extraction des options par clonage ou par défaut
        const optionsCopy = options
            ? JSON.parse(JSON.stringify(options))
            : this.defaultOptions;
        // Validation des options
        if (optionsCopy.players.length < 3 || optionsCopy.players.length > 5) {
            throw new Error('INVALID_NUMBER_OF_PLAYERS');
        }
        // Prise en compte des options
        this.players = optionsCopy.players; // || ['Joueur1', 'Joueur2'];
        // Initialisation de la Game
        this.status = GameStatus.Created;
    }
    //#endregion Getters ------------------------------------------------------------------
    //#region Actions #####################################################################
    start() {
        if (this.status === GameStatus.Created) {
            this.status = GameStatus.OnGoing;
            // this.currentTurn = 1;
            this.currentBoardState = new board_state_1.default(this.players);
        }
        else {
            throw new Error('INVALID_GAME_STATUS');
        }
    }
    terminate() {
        if (this.status === GameStatus.OnGoing) {
            this.scores = [];
            this.getPlayers().forEach((player) => {
                this.scores.push([player, this.getBoardState().getFinalScore(player)]);
            });
            this.scores.sort((s1, s2) => s1[1] - s2[1]);
            this.status = GameStatus.Terminated;
            this.currentBoardState = undefined;
        }
        else {
            throw new Error('INVALID_GAME_STATUS');
        }
    }
    playNextTurn(action) {
        if (this.status === GameStatus.OnGoing) {
            if (action === GameAction.Pay) {
                try {
                    this.getBoardState().pay();
                }
                catch (err) {
                    throw err;
                }
                this.getBoardState().switchActivePlayer();
            }
            else {
                // action par défaut
                try {
                    this.getBoardState().take();
                }
                catch (e) {
                    const err = e;
                    if (err.message === 'END_OF_GAME') {
                        this.terminate();
                        throw err;
                    }
                }
            }
            this.getBoardState().incrementTurn();
        }
        else {
            throw new Error('INVALID_GAME_STATUS');
        }
    }
}
exports.default = Game;
//#region Types et Interfaces annexes ###################################################
var GameStatus;
(function (GameStatus) {
    GameStatus["Created"] = "Created";
    GameStatus["OnGoing"] = "OnGoing";
    GameStatus["Terminated"] = "Terminated";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
var GameAction;
(function (GameAction) {
    GameAction["Pay"] = "Pay";
    GameAction["Take"] = "Take";
})(GameAction = exports.GameAction || (exports.GameAction = {}));
//#endregion Types et Interfaces annexes ################################################
//# sourceMappingURL=game.js.map