"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Game {
    constructor() {
        // console.log('Game constructor');
        this.status = GameStatus.Created;
    }
    start() {
        this.status = GameStatus.OnGoing;
        this.currentTurn = 1;
        return true;
    }
    terminate() {
        this.status = GameStatus.Terminated;
        return true;
    }
    getStatus() {
        return this.status;
    }
    getCurrentTurn() {
        return this.currentTurn;
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