"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_1 = require("./board");
const board_helper_1 = require("./board-helper");
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
        this.getBoard = () => this.board;
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
            const initState = board_helper_1.default.initBoardState({ playerList: this.players });
            this.board = new board_1.default(initState, []);
            this.board.revealNewCard();
        }
        else {
            throw new Error('INVALID_GAME_STATUS');
        }
    }
    terminate() {
        if (this.status === GameStatus.OnGoing) {
            this.scores = this.getBoard().getScores();
            // this.getPlayers().forEach((player) => {
            //   this.scores.push([player, this.getBoard().getScores().find((p) => p.)]);
            // });
            // this.scores.sort((s1: [string, number], s2: [string, number]) => s1[1] - s2[1]);
            this.status = GameStatus.Terminated;
            this.board = undefined;
        }
        else {
            throw new Error('INVALID_GAME_STATUS');
        }
    }
    playNextTurn(action) {
        if (this.status === GameStatus.OnGoing) {
            if (action === board_helper_1.ActionType.PAY) {
                try {
                    this.getBoard().pay();
                }
                catch (err) {
                    throw err;
                }
                this.getBoard().switchActivePlayer();
            }
            else if (action === board_helper_1.ActionType.TAKE || action === undefined) {
                // action par défaut
                try {
                    this.getBoard().take();
                    this.getBoard().revealNewCard();
                }
                catch (e) {
                    const err = e;
                    if (err.message === 'END_OF_GAME') {
                        this.terminate();
                        throw err;
                    }
                }
            }
            else {
                throw new Error('INVALID_PLAY_NEXT_TURN_ACTION_TYPE');
            }
            this.getBoard().incrementTurn();
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
//#endregion Types et Interfaces annexes ################################################
//# sourceMappingURL=game.js.map