"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const board_state_1 = require("./board-state");
class Game {
    /***************************************
     * Constructeur
     **************************************/
    constructor(options) {
        this.getBoardState = () => this.currentBoardState;
        if (options) {
            // Copie des inputs pour éviter des modifications non maitrisées a posteriori
            const optionsCopy = JSON.parse(JSON.stringify(options));
            // Validation des options
            if (optionsCopy.players.length < 3 || optionsCopy.players.length > 5) {
                throw new Error('INVALID_NUMBER_OF_PLAYERS');
            }
            // Prise en compte des options
            this.players = optionsCopy.players; // || ['Joueur1', 'Joueur2'];
        }
        this.status = GameStatus.Created;
    }
    /***************************************
     * Getters
     **************************************/
    getStatus() {
        return this.status;
    }
    getPlayers() {
        return this.players;
    }
    getCurrentTurn() {
        return this.currentTurn;
    }
    /***************************************
     * Actions
     **************************************/
    start() {
        if (this.status === GameStatus.Created) {
            this.status = GameStatus.OnGoing;
            this.currentTurn = 1;
            this.currentBoardState = new board_state_1.default();
            return true;
        }
        else {
            return false;
        }
    }
    terminate() {
        if (this.status === GameStatus.OnGoing) {
            this.status = GameStatus.Terminated;
            this.currentBoardState = undefined;
            return true;
        }
        else {
            return false;
        }
    }
    playNextTurn() {
        if (this.status === GameStatus.OnGoing) {
            this.currentTurn += 1;
            return true;
        }
        else {
            return false;
        }
    }
}
exports.default = Game;
var GameStatus;
(function (GameStatus) {
    GameStatus["Created"] = "Created";
    GameStatus["OnGoing"] = "OnGoing";
    GameStatus["Terminated"] = "Terminated";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
//# sourceMappingURL=game.js.map