"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = require("./deck");
/**
 * Error list:
 * - Error ('NOT_ENOUGH_TOKENS')
 * - Error ('NO_MORE_CARD')
 * - Error ('END_OF_GAME')
 */
class BoardState {
    constructor(players) {
        this.getCurrentCard = () => this.currentCard;
        this.getCurrentDeckSize = () => this.currentDeck.getSize();
        this.getCurrentTokenBagSize = () => this.currentTokenBag;
        this.getCurrentPlayerCardPiles = (player) => this.currentPlayerCardPiles[player];
        this.getCurrentPlayerTokenPile = (player) => this.currentPlayerTokenPiles[player];
        this.getActivePlayer = () => this.activePlayer;
        this.currentDeck = new deck_1.default(24);
        this.currentCard = this.currentDeck.drawNextCard();
        this.currentTokenBag = 0;
        this.currentPlayerCardPiles = {};
        this.currentPlayerTokenPiles = {};
        players.forEach((player) => {
            this.currentPlayerCardPiles[player] = [];
            this.currentPlayerTokenPiles[player] = 11;
        });
        this.activePlayer = players[0];
    }
    getCardScore(player) {
        const score = this.getCurrentPlayerCardPiles(player)
            .map((card) => card.getValue())
            .sort((v1, v2) => v1 - v2)
            .reduce((totalScore, currentValue, i, array) => {
            return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
        }, 0);
        return score;
    }
    getFinalScore(player) {
        return this.getCardScore(player) - this.getCurrentPlayerTokenPile(player);
    }
    addTokenToBag() {
        this.currentTokenBag++;
    }
    removeTokenFromBag() {
        this.currentTokenBag--;
    }
    switchActivePlayer(playerList) {
        if (playerList.indexOf(this.activePlayer) === playerList.length - 1) {
            this.activePlayer = playerList[0];
        }
        else {
            this.activePlayer = playerList[playerList.indexOf(this.activePlayer) + 1];
        }
    }
    pay() {
        if (this.getCurrentPlayerTokenPile(this.activePlayer) <= 0) {
            throw new Error('NOT_ENOUGH_TOKENS');
        }
        else if (!this.getCurrentCard()) {
            throw new Error('NO_MORE_CARD');
        }
        else {
            this.currentPlayerTokenPiles[this.activePlayer]--;
            this.addTokenToBag();
        }
    }
    take() {
        if (!this.getCurrentCard()) {
            throw new Error('NO_MORE_CARD');
        }
        else {
            this.currentPlayerTokenPiles[this.activePlayer] += this.currentTokenBag;
            this.currentTokenBag = 0;
            this.currentPlayerCardPiles[this.activePlayer].push(this.currentCard);
            try {
                this.currentCard = this.currentDeck.drawNextCard();
            }
            catch (e) {
                const err = e;
                if (err.message === 'EMPTY_DECK') {
                    this.currentCard = undefined;
                    throw new Error('END_OF_GAME');
                }
                else {
                    throw e;
                }
            }
        }
    }
}
exports.default = BoardState;
//# sourceMappingURL=board-state.js.map