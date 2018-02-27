"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcts_game_1 = require("../mcts/mcts-game");
const board_helper_1 = require("../../src/core/board-helper");
class Board extends mcts_game_1.MctsGame {
    constructor(initState, history) {
        super();
        this.history = [];
        //#region Getters #####################################################################
        this.getHistory = () => this.history.map((line) => (Object.assign({}, line)));
        this.getInitState = () => board_helper_1.default.cloneState(this.initState);
        this.getState = () => board_helper_1.default.cloneState(this.state);
        if (!initState) {
            initState = board_helper_1.default.getDefaultBoardState();
        }
        if (!history) {
            history = [];
        }
        board_helper_1.default.validateBoardState(initState);
        board_helper_1.default.validateHistory(history);
        this.initState = board_helper_1.default.cloneState(initState);
        this.state = board_helper_1.default.cloneState(this.initState);
        history.forEach((line) => this.performMove(line));
    }
    getScores() {
        const scores = [];
        this.state.players.forEach(({ name, hiddenTokens }) => {
            scores.push([name, this.getPlayerCardScore(name) - hiddenTokens]);
        });
        scores.sort((s1, s2) => s1[1] - s2[1]);
        return scores;
    }
    //#endregion Getters ------------------------------------------------------------------
    //#region Actions #####################################################################
    pay() {
        if (this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens <= 0) {
            throw new Error('NOT_ENOUGH_TOKENS');
        }
        else if (!this.state.visibleCard) {
            throw new Error('NO_VISIBLE_CARD');
        }
        else {
            this.state.visibleTokens++;
            this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens--;
            this.history.push({ type: board_helper_1.ActionType.PAY });
        }
    }
    take() {
        if (!this.state.visibleCard) {
            throw new Error('NO_VISIBLE_CARD');
        }
        else {
            this.state.players.find((p) => p.name === this.state.activePlayer).cards
                .push(this.state.visibleCard);
            this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens
                = this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens
                    + this.state.visibleTokens;
            this.state.visibleTokens = 0;
            this.history.push({ type: board_helper_1.ActionType.TAKE });
            this.state.visibleCard = undefined;
        }
    }
    incrementTurn() {
        this.state.turn++;
    }
    switchActivePlayer() {
        const playerList = this.state.players.map((p) => p.name);
        if (playerList.indexOf(this.state.activePlayer) === playerList.length - 1) {
            this.state.activePlayer = playerList[0];
        }
        else {
            this.state.activePlayer = playerList[playerList.indexOf(this.state.activePlayer) + 1];
        }
    }
    revealNewCard() {
        if (this.state.visibleCard !== undefined) {
            throw new Error('CARD_ALREADY_REVEALED');
        }
        if (this.state.deckSize === 0) {
            throw new Error('END_OF_GAME');
        }
        // try {
        this.state.visibleCard = board_helper_1.default.shuffle(board_helper_1.default.listAvailableCards(this.state)).pop(); // TODO SHUFFLE
        this.state.deckSize--;
        this.history.push({ type: board_helper_1.ActionType.DRAW, payload: this.state.visibleCard });
        // } catch (e) {
        //   const err: Error = e;
        //   if (err.message === 'EMPTY_DECK') {
        //     this.state.visibleCard = undefined;
        //     throw new Error('END_OF_GAME');
        //   } else {
        //     throw e;
        //   }
        // }
    }
    //#endregion Actions ------------------------------------------------------------------
    //#region Actions MCTS ################################################################
    getPossibleMoves() {
        if (this.isDecisionNode()) {
            // console.log(this.getPossibleAction());
            return this.getPossibleAction();
        }
        else {
            // console.log(this.getPossibleDraw());
            return this.getPossibleDraw();
        }
    }
    getCurrentPlayer() {
        return this.state.activePlayer;
    }
    performMove(action) {
        if (this.isDecisionNode()) {
            this.performAction(action);
        }
        else if (action.type === board_helper_1.ActionType.DRAW) {
            this.performDraw(action);
        }
        else {
            throw new Error('INVALID_ACTION');
        }
    }
    getWinner() {
        if (this.state.visibleCard === undefined && this.state.deckSize === 0) {
            return this.getScores()[0][0];
        }
        else {
            return null;
        }
    }
    //#endregion Actions MCTS -------------------------------------------------------------
    //#region Méthodes privées ############################################################
    getPlayerCardScore(player) {
        return this.state.players.find((p) => p.name === player).cards
            .sort((v1, v2) => v1 - v2)
            .reduce((totalScore, currentValue, i, array) => {
            return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
        }, 0);
    }
    isDecisionNode() {
        if (this.state.visibleCard !== undefined) {
            return true;
        }
        else {
            return false;
        }
    }
    getPossibleAction() {
        const moves = [];
        if (this.state.visibleCard) {
            moves.push({ type: board_helper_1.ActionType.TAKE });
            if (this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens > 0) {
                moves.push({ type: board_helper_1.ActionType.PAY });
            }
        }
        return moves;
    }
    getPossibleDraw() {
        // console.log('deckSize:', this.state.deckSize);
        if (this.state.deckSize === 0) {
            return [];
        }
        // const possibleDraws: IDraw[] = [{
        //   payload: 3,
        //   type: ActionType.DRAW,
        // }];
        const possibleDraws = board_helper_1.default
            .listAvailableCards(this.state)
            .map((c) => ({ type: board_helper_1.ActionType.DRAW, payload: c }));
        return possibleDraws;
    }
    performAction(action) {
        if (action.type === board_helper_1.ActionType.PAY) {
            this.pay();
            this.switchActivePlayer();
        }
        else if (action.type === board_helper_1.ActionType.TAKE || !action) {
            // action par défaut
            try {
                this.take();
            }
            catch (e) {
                const err = e;
                if (err.message === 'END_OF_GAME') {
                    // console.log('performMove/END_OF_GAME');
                    // console.log(this.getScores());
                }
                else {
                    throw e;
                }
            }
        }
        else {
            throw new Error('INVALID_ACTION');
        }
        this.incrementTurn();
    }
    performDraw(draw) {
        if (this.state.visibleCard !== undefined) {
            throw new Error('CARD_ALREADY_REVEALED');
        }
        if (this.state.deckSize === 0) {
            throw new Error('END_OF_GAME');
        }
        const revealedCards = board_helper_1.default.listVisibleCards(this.state);
        if (revealedCards.find((c) => c === draw.payload) !== undefined) {
            throw new Error('CARD_ALREADY_ON_BOARD');
        }
        else {
            this.state.visibleCard = draw.payload;
            this.state.deckSize--;
            this.history.push(draw);
        }
    }
}
exports.default = Board;
//# sourceMappingURL=board.js.map