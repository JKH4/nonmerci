
import { MctsGame } from '../mcts/mcts-game';

import BoardHelper, {
  ActionType,
  BoardHistory,
  IBoardState,
  IDraw,
  IGameAction,
} from '../../src/core/board-helper';

export default class Board extends MctsGame {
  private history: BoardHistory = [];
  private initState: IBoardState;
  private state: IBoardState;
  constructor(initState?: IBoardState, history?: BoardHistory) {
    super();
    if (!initState) {
      initState = BoardHelper.getDefaultBoardState();
    }
    if (!history) {
      history = [];
    }
    BoardHelper.validateBoardState(initState);
    BoardHelper.validateHistory(history);
    this.initState = BoardHelper.cloneState(initState);
    this.state = BoardHelper.cloneState(this.initState);
    history.forEach((line) => this.performMove(line) );
  }

  //#region Getters #####################################################################
  public getHistory = (): BoardHistory => this.history.map((line) => ({ ...line }));
  public getInitState = () => BoardHelper.cloneState(this.initState);
  public getState = () => BoardHelper.cloneState(this.state);
  public getScores(): Array<[string, number]> {
    const scores: Array<[string, number]> = [];
    this.state.players.forEach(({ name, hiddenTokens }) => {
      scores.push([name, this.getPlayerCardScore(name) - hiddenTokens]);
    });
    scores.sort((s1: [string, number], s2: [string, number]) => s1[1] - s2[1]);
    return scores;
  }
  //#endregion Getters ------------------------------------------------------------------

  //#region Actions #####################################################################
  public pay() {
    if (this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens <= 0) {
      throw new Error ('NOT_ENOUGH_TOKENS');
    } else if (!this.state.visibleCard) {
      throw new Error ('NO_VISIBLE_CARD');
    } else {
      this.state.visibleTokens++;
      this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens--;
      this.history.push({ type: ActionType.PAY });
    }
  }

  public take() {
    if (!this.state.visibleCard) {
      throw new Error ('NO_VISIBLE_CARD');
    } else {
      this.state.players.find((p) => p.name === this.state.activePlayer).cards
        .push(this.state.visibleCard);

      this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens
        = this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens
        + this.state.visibleTokens;

      this.state.visibleTokens = 0;
      this.history.push({ type: ActionType.TAKE });
      this.state.visibleCard = undefined;
    }
  }

  public incrementTurn() {
    this.state.turn++;
  }

  public switchActivePlayer() {
    const playerList = this.state.players.map((p) => p.name);
    if (playerList.indexOf(this.state.activePlayer) === playerList.length - 1) {
      this.state.activePlayer = playerList[0];
    } else {
      this.state.activePlayer = playerList[playerList.indexOf(this.state.activePlayer) + 1];
    }
  }

  public revealNewCard() {
    if (this.state.visibleCard !== undefined) {
      throw new Error('CARD_ALREADY_REVEALED');
    }
    if (this.state.deckSize === 0) {
      throw new Error('END_OF_GAME');
    }

    // try {
    this.state.visibleCard = BoardHelper.shuffle(BoardHelper.listAvailableCards(this.state)).pop(); // TODO SHUFFLE
    this.state.deckSize--;
    this.history.push({ type: ActionType.DRAW, payload: this.state.visibleCard });
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
  public getPossibleMoves(): IDraw[] | IGameAction[] {
    if (this.isDecisionNode()) {
      // console.log(this.getPossibleAction());
      return this.getPossibleAction();
    } else {
      // console.log(this.getPossibleDraw());
      return this.getPossibleDraw();
    }
  }
  public getCurrentPlayer(): string {
    return this.state.activePlayer;
  }
  public performMove(action?: IDraw | IGameAction) {
    if (this.isDecisionNode()) {
      this.performAction((action as IGameAction));
    } else if (action.type === ActionType.DRAW) {
      this.performDraw((action as IDraw));
    } else {
      throw new Error('INVALID_ACTION');
    }
  }
  public getWinner(): string {
    if (this.state.visibleCard === undefined && this.state.deckSize === 0) {
      return this.getScores()[0][0];
    } else {
      return null;
    }
  }
  //#endregion Actions MCTS -------------------------------------------------------------

  //#region Méthodes privées ############################################################
  private getPlayerCardScore(player: string): number {
    return this.state.players.find((p) => p.name === player).cards
      .sort((v1, v2) => v1 - v2)
      .reduce((totalScore: number, currentValue: number, i, array) => {
        return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
      }, 0);
  }
  private isDecisionNode(): boolean {
    if (this.state.visibleCard !== undefined) {
      return true;
    } else {
      return false;
    }
  }
  private getPossibleAction(): IGameAction[] {
    const moves: IGameAction[] = [];
    if (this.state.visibleCard) {
      moves.push({type: ActionType.TAKE});
      if (this.state.players.find((p) => p.name === this.state.activePlayer).hiddenTokens > 0) {
        moves.push({type: ActionType.PAY});
      }
    }
    return moves;
  }
  private getPossibleDraw(): IDraw[] {
    // console.log('deckSize:', this.state.deckSize);
    if (this.state.deckSize === 0) {
      return [];
    }
    // const possibleDraws: IDraw[] = [{
    //   payload: 3,
    //   type: ActionType.DRAW,
    // }];
    const possibleDraws: IDraw[] = BoardHelper
      .listAvailableCards(this.state)
      .map((c) => ({ type: (ActionType.DRAW as ActionType.DRAW), payload: c }));
    return possibleDraws;
  }
  private performAction(action?: IGameAction) {
    if (action.type === ActionType.PAY) {
      this.pay();
      this.switchActivePlayer();
    } else if (action.type === ActionType.TAKE || !action) {
      // action par défaut
      try {
        this.take();
      } catch (e) {
        const err: Error = e;
        if (err.message === 'END_OF_GAME') {
          // console.log('performMove/END_OF_GAME');
          // console.log(this.getScores());
        } else {
          throw e;
        }
      }
    } else {
      throw new Error('INVALID_ACTION');
    }
    this.incrementTurn();
  }
  private performDraw(draw: IDraw) {
    if (this.state.visibleCard !== undefined) {
      throw new Error('CARD_ALREADY_REVEALED');
    }
    if (this.state.deckSize === 0) {
      throw new Error('END_OF_GAME');
    }
    const revealedCards =  BoardHelper.listVisibleCards(this.state);
    if (revealedCards.find((c) => c === draw.payload) !== undefined) {
      throw new Error('CARD_ALREADY_ON_BOARD');
    } else {
      this.state.visibleCard = draw.payload;
      this.state.deckSize--;
      this.history.push(draw);
    }
  }
  //#endregion Méthodes privées ---------------------------------------------------------
}
