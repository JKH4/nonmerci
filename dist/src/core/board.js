"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const card_1 = require("./card");
const deck_1 = require("./deck");
/**
 * Error list:
 * - Error ('INVALID_NUMBER_OF_PLAYER')
 * - Error ('INVALID_BOARD_STATE')
 * - Error ('INVALID_PLAYER')
 * - Error ('NOT_ENOUGH_TOKENS')
 * - Error ('NO_MORE_CARD')
 * - Error ('END_OF_GAME')
 */
class Board {
    /***
     * Constructor
     */
    constructor(options) {
        //#region Getters #####################################################################
        this.getPlayerState = (player) => {
            if (!player) {
                player = this.state.activePlayer;
            }
            if (!this.state.playerTokens.find((p) => p.name === player)) {
                throw new Error('INVALID_PLAYER');
            }
            return {
                activePlayer: this.state.activePlayer,
                board: {
                    deckSize: this.state.board.deck.getSize(),
                    playerCards: [
                        ...this.state.board.playerCards
                            .map(({ name, cards }) => ({ name, cards: cards.map((c) => c.getValue()) })),
                    ],
                    visibleCard: this.state.board.visibleCard ? this.state.board.visibleCard.getValue() : undefined,
                    visibleTokens: this.state.board.visibleTokens,
                },
                privateData: {
                    currentScore: this.getFinalScore(player),
                    hiddenTokens: this.state.playerTokens.find((p) => p.name === player).hiddenTokens,
                    playerName: player,
                },
                turn: this.state.turn,
            };
        };
        this.getState = () => {
            return {
                activePlayer: this.state.activePlayer,
                board: {
                    deck: this.state.board.deck.getState(),
                    playerCards: this.state.board.playerCards
                        .map(({ name, cards }) => ({ name, cards: cards.map((c) => c.getValue()) })),
                    visibleCard: this.state.board.visibleCard ? this.state.board.visibleCard.getValue() : undefined,
                    visibleTokens: this.state.board.visibleTokens,
                },
                playerTokens: this.state.playerTokens.map((p) => ({ name: p.name, hiddenTokens: p.hiddenTokens })),
                turn: this.state.turn,
            };
        };
        if (options.fullBoardState) {
            this.state = {
                activePlayer: options.fullBoardState.activePlayer,
                board: {
                    deck: new deck_1.default({ cardValues: options.fullBoardState.board.deck }),
                    playerCards: options.fullBoardState.board.playerCards
                        .map((p) => ({ name: p.name, cards: p.cards.map((c) => new card_1.default(c)) })),
                    visibleCard: options.fullBoardState.board.visibleCard
                        ? new card_1.default(options.fullBoardState.board.visibleCard)
                        : undefined,
                    visibleTokens: options.fullBoardState.board.visibleTokens,
                },
                playerTokens: options.fullBoardState.playerTokens,
                turn: options.fullBoardState.turn,
            };
        }
        else {
            if (options.players.length === 0 || options.players.length > 5) {
                throw new Error('INVALID_NUMBER_OF_PLAYER');
            }
            const temporaryDeck = new deck_1.default({ size: 24 });
            this.state = {
                activePlayer: options.players[0],
                board: {
                    deck: temporaryDeck,
                    playerCards: options.players.map((p) => ({ name: p, cards: [] })),
                    visibleCard: temporaryDeck.drawNextCard(),
                    visibleTokens: 0,
                },
                playerTokens: options.players.map((p) => ({ name: p, hiddenTokens: 11 })),
                turn: 1,
            };
        }
    }
    getFinalScore(player) {
        return this.getCardScore(player) - this.state.playerTokens.find((p) => p.name === player).hiddenTokens;
    }
    //#endregion Getters ------------------------------------------------------------------
    //#region Actions #####################################################################
    incrementTurn() {
        this.state.turn++;
    }
    switchActivePlayer() {
        const playerList = this.state.playerTokens.map((p) => p.name);
        if (playerList.indexOf(this.state.activePlayer) === playerList.length - 1) {
            this.state.activePlayer = playerList[0];
        }
        else {
            this.state.activePlayer = playerList[playerList.indexOf(this.state.activePlayer) + 1];
        }
    }
    pay() {
        if (this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens <= 0) {
            throw new Error('NOT_ENOUGH_TOKENS');
        }
        else if (!this.state.board.visibleCard) {
            throw new Error('NO_MORE_CARD');
        }
        else {
            this.state.board.visibleTokens++;
            this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens--;
        }
    }
    take() {
        if (!this.state.board.visibleCard) {
            throw new Error('NO_MORE_CARD');
        }
        else {
            this.state.board.playerCards.find((p) => p.name === this.state.activePlayer).cards
                .push(this.state.board.visibleCard);
            this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens
                = this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens
                    + this.state.board.visibleTokens;
            this.state.board.visibleTokens = 0;
            try {
                this.state.board.visibleCard = this.state.board.deck.drawNextCard();
            }
            catch (e) {
                const err = e;
                if (err.message === 'EMPTY_DECK') {
                    this.state.board.visibleCard = undefined;
                    throw new Error('END_OF_GAME');
                }
                else {
                    throw e;
                }
            }
        }
    }
    //#endregion Actions ------------------------------------------------------------------
    //#region Méthodes privées ############################################################
    getCardScore(player) {
        // console.log('getCardScore(' + player + ') = ', this.state.board.playerCards.find((p) => p.name === player).cards
        //   .map((card: Card) => card.getValue())
        //   .sort((v1, v2) => v1 - v2));
        return this.state.board.playerCards.find((p) => p.name === player).cards
            .map((card) => card.getValue())
            .sort((v1, v2) => v1 - v2)
            .reduce((totalScore, currentValue, i, array) => {
            return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
        }, 0);
    }
}
exports.default = Board;
//# sourceMappingURL=board.js.map