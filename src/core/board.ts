import Card from './card';
import Deck from './deck';
import Game, { GameAction, IGameOptions } from './game';

import { MctsGame } from '../mcts/mcts-game';

/**
 * Error list:
 * - Error ('INVALID_NUMBER_OF_PLAYER')
 * - Error ('INVALID_BOARD_STATE')
 * - Error ('INVALID_CONTRUCTOR_OPTIONS')
 * - Error ('INVALID_PLAYER')
 * - Error ('INVALID_ACTION')
 * - Error ('CARD_ALREADY_REVEALED')
 * - Error ('CARD_ALREADY_ON_BOARD')
 * - Error ('NOT_ENOUGH_TOKENS')
 * - Error ('NO_MORE_CARD')
 * - Error ('END_OF_GAME')
 */
export default class Board extends MctsGame {
  private state: IBoardState;

  /***
   * Constructor
   * options:
   *  .fullBoardState: P0: recréé un Board dans un état totalement défini (joueurs, decks, jetons, cartes, tours, etc.)
   *  .players: P1: initialise un Board dans un état 'initial' a partir de la liste de joueurs
   *                (joueurs, deck aléatoire de 24 cartes, 11 jetons par joueurs)
   */
  constructor(options?: {
    fullBoardState?: IFullBoardState,
    players?: string[],
  }) {
    super();
    if (!options) {
      options = { players: ['J1', 'J2', 'J3'] };
    }
    if (options.fullBoardState) {
      if (!this.isStateValid(options.fullBoardState)) {
        throw new Error('INVALID_BOARD_STATE');
      }
      this.state = {
        activePlayer: options.fullBoardState.activePlayer,
        board: {
          deck: new Deck({ cardValues: options.fullBoardState.board.deck }),
          playerCards: options.fullBoardState.board.playerCards
            .map((p) => ({ name: p.name, cards: p.cards.map((c) => new Card(c))})),
          visibleCard: options.fullBoardState.board.visibleCard
            ? new Card(options.fullBoardState.board.visibleCard)
            : undefined,
          visibleTokens: options.fullBoardState.board.visibleTokens,
        },
        playerTokens: options.fullBoardState.playerTokens,
        turn: options.fullBoardState.turn,
      };
    } else if (options.players) {
      if (options.players.length === 0 || options.players.length > 5) {
        throw new Error('INVALID_NUMBER_OF_PLAYER');
      }
      const temporaryDeck = new Deck({size: 24});
      this.state = {
        activePlayer: options.players[0],
        board: {
          deck: temporaryDeck,
          playerCards: options.players.map((p) => ({ name: p, cards: []})),
          visibleCard: temporaryDeck.drawNextCard(),
          visibleTokens: 0,
        },
        playerTokens: options.players.map((p) => ({ name: p, hiddenTokens: 11 })),
        turn: 1,
      };
    } else {
      throw new Error('INVALID_CONTRUCTOR_OPTIONS');
    }
  }

  //#region Getters #####################################################################
  public getPlayerState = (player?: string): IPlayerBoardState => {
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
            .map(({name, cards}) => ({ name, cards: cards.map((c) => c.getValue()) })),
        ],
        visibleCard: this.state.board.visibleCard ? this.state.board.visibleCard.getValue() : undefined,
        visibleTokens: this.state.board.visibleTokens,
      },
      privateData: {
        currentScore: this.getPlayerScore(player),
        hiddenTokens: this.state.playerTokens.find((p) => p.name === player).hiddenTokens,
        playerName: player,
      },
      turn: this.state.turn,
    };
  }

  public getState = (): IFullBoardState => {
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
  }

  public getPlayerScore(player: string): number {
    return this.getPlayerCardScore(player) - this.state.playerTokens.find((p) => p.name === player).hiddenTokens;
  }

  public getScores(): Array<[string, number]> {
    const scores: Array<[string, number]> = [];
    this.state.playerTokens.forEach(({ name, hiddenTokens }) => {
      scores.push([name, this.getPlayerCardScore(name) - hiddenTokens]);
    });
    scores.sort((s1: [string, number], s2: [string, number]) => s1[1] - s2[1]);
    return scores;
  }
  //#endregion Getters ------------------------------------------------------------------

  //#region Actions #####################################################################
  public incrementTurn() {
    this.state.turn++;
  }

  public switchActivePlayer() {
    const playerList = this.state.playerTokens.map((p) => p.name);
    if (playerList.indexOf(this.state.activePlayer) === playerList.length - 1) {
      this.state.activePlayer = playerList[0];
    } else {
      this.state.activePlayer = playerList[playerList.indexOf(this.state.activePlayer) + 1];
    }
  }

  public pay() {
    if (this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens <= 0) {
      throw new Error ('NOT_ENOUGH_TOKENS');
    } else if (!this.state.board.visibleCard) {
      throw new Error ('NO_VISIBLE_CARD');
    } else {
      this.state.board.visibleTokens++;
      this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens--;
    }
  }

  public take() {
    if (!this.state.board.visibleCard) {
      throw new Error ('NO_VISIBLE_CARD');
    } else {
      this.state.board.playerCards.find((p) => p.name === this.state.activePlayer).cards
        .push(this.state.board.visibleCard);

      this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens
        = this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens
        + this.state.board.visibleTokens;

      this.state.board.visibleTokens = 0;
      this.state.board.visibleCard = undefined;
    }
  }

  public revealNewCard() {
    if (this.state.board.visibleCard !== undefined) {
      throw new Error('CARD_ALREADY_REVEALED');
    }

    try {
      this.state.board.visibleCard = this.state.board.deck.drawNextCard();
    } catch (e) {
      const err: Error = e;
      if (err.message === 'EMPTY_DECK') {
        this.state.board.visibleCard = undefined;
        throw new Error('END_OF_GAME');
      } else {
        throw e;
      }
    }
  }
  //#endregion Actions ------------------------------------------------------------------

  //#region Actions MCTS ################################################################
  public getPossibleMoves(): GameAction[] | Card[] {
    if (this.isDecisionNode()) {
      const moves: GameAction[] = [];
      if (this.state.board.visibleCard) {
        moves.push(GameAction.Take);
        if (this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens > 0) {
          moves.push(GameAction.Pay);
        }
      }
      return moves;
    } else {
      if (this.state.board.deck.getSize() === 0) {
        return [];
      }
      const revealedCards = this.getRevealedCards();
      const possibleDraws: Card[] = [];
      for (let i = 3; i < 36; i++) {
        if (revealedCards.find((c) => c.getValue() === i) === undefined) {
          possibleDraws.push(new Card(i));
        }
      }
      return possibleDraws;
    }
  }
  public getCurrentPlayer(): string {
    return this.state.activePlayer;
  }
  public performMove(action?: GameAction | Card) {
    if (this.isDecisionNode()) {
      if (action === GameAction.Pay) {
        this.pay();
        this.switchActivePlayer();
      } else if (action === GameAction.Take || !action) {
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
    } else if (action instanceof Card) {
      const card: Card = action;
      const revealedCards = this.getRevealedCards();
      if (this.state.board.visibleCard !== undefined) {
        throw new Error('CARD_ALREADY_REVEALED');
      }
      if (revealedCards.find((c) => c.getValue() === card.getValue()) !== undefined) {
        throw new Error('CARD_ALREADY_ON_BOARD');
      } else {
        try {
          this.state.board.deck.drawNextCard();
        } catch (e) {
          const err: Error = e;
          if (err.message === 'EMPTY_DECK') {
            this.state.board.visibleCard = undefined;
            throw new Error('END_OF_GAME');
          } else {
            throw e;
          }
        }
        this.state.board.visibleCard = card;
        // this.state.board.deck.drawNextCard();
      }
    } else {
      throw new Error('INVALID_ACTION');
    }
  }
  public getWinner(): string {
    if (this.state.board.visibleCard === undefined) {
      return this.getScores()[0][0];
    } else {
      return null;
    }
  }
  //#endregion Actions MCTS -------------------------------------------------------------

  //#region Méthodes privées ############################################################
  private getPlayerCardScore(player: string): number {
    return this.state.board.playerCards.find((p) => p.name === player).cards
      .map((card: Card) => card.getValue())
      .sort((v1, v2) => v1 - v2)
      .reduce((totalScore: number, currentValue: number, i, array) => {
        return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
      }, 0);
  }

  private isStateValid(state: IFullBoardState): boolean {
    if (!state.board.playerCards.find((p) => p.name === state.activePlayer)) {
      return false;
    }
    if (!state.board.playerCards.every((pc) => state.playerTokens.find((pt) => pc.name === pt.name) !== undefined )) {
      return false;
    }
    const allCards = state.board.deck
      .concat([state.board.visibleCard])
      .concat(state.board.playerCards.map((p) => p.cards).reduce((prev, curr) => prev.concat(curr), []));
    // console.log(allCards, new Set(allCards));
    if (allCards.length !== new Set(allCards).size) {
      return false;
    }
    return true;
  }

  private getRevealedCards(): Card[] {
    let revealedCards: Card[] = [];
    if (this.state.board.visibleCard !== undefined) {
      revealedCards.push(this.state.board.visibleCard);
    }
    this.state.board.playerCards.forEach(({name, cards}) => revealedCards = revealedCards.concat(cards));
    return revealedCards;
  }

  private isDecisionNode(): boolean {
    if (this.state.board.visibleCard !== undefined) {
      return true;
    } else {
      return false;
    }
  }
  //#endregion Méthodes privées ---------------------------------------------------------
}

interface IBoardState {
  activePlayer: string;
  board: {
    deck: Deck;
    visibleCard: Card;
    visibleTokens: number;
    playerCards: Array<{
      name: string;
      cards: Card[];
    }>;
  };
  playerTokens: Array<{
    name: string;
    hiddenTokens: number;
  }>;
  turn: number;
}

export interface IFullBoardState {
  activePlayer: string;
  board: {
    deck: number[];
    visibleCard: number;
    visibleTokens: number;
    playerCards: Array<{
      name: string;
      cards: number[];
    }>;
  };
  playerTokens: Array<{
    name: string;
    hiddenTokens: number;
  }>;
  turn: number;
}

export interface IPlayerBoardState {
  activePlayer: string;
  privateData: {
    playerName: string;
    currentScore: number;
    hiddenTokens: number;
  };
  board: {
    deckSize: number;
    visibleCard: number;
    visibleTokens: number;
    playerCards: Array<{
      name: string;
      cards: number[];
    }>;
  };
  turn: number;
}
