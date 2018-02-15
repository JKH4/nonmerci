import Card from './card';
import Deck from './deck';
import { IGameOptions } from './game';

/**
 * Error list:
 * - Error ('INVALID_NUMBER_OF_PLAYER')
 * - Error ('INVALID_BOARD_STATE')
 * - Error ('INVALID_PLAYER')
 * - Error ('NOT_ENOUGH_TOKENS')
 * - Error ('NO_MORE_CARD')
 * - Error ('END_OF_GAME')
 */
export default class Board {
  private state: IBoardState;

  /***
   * Constructor
   */
  constructor(options: {
    fullBoardState?: IFullBoardState,
    // deck?: Deck,
    players?: string[],
  }) {
    if (options.fullBoardState) {
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
    } else {
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
        currentScore: this.getFinalScore(player),
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

  public getFinalScore(player: string): number {
    return this.getCardScore(player) - this.state.playerTokens.find((p) => p.name === player).hiddenTokens;
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
      throw new Error ('NO_MORE_CARD');
    } else {
      this.state.board.visibleTokens++;
      this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens--;
    }
  }

  public take() {
    if (!this.state.board.visibleCard) {
      throw new Error ('NO_MORE_CARD');
    } else {
      this.state.board.playerCards.find((p) => p.name === this.state.activePlayer).cards
        .push(this.state.board.visibleCard);

      this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens
        = this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens
        + this.state.board.visibleTokens;

      this.state.board.visibleTokens = 0;
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
  }
  //#endregion Actions ------------------------------------------------------------------

  //#region Méthodes privées ############################################################
  private getCardScore(player: string): number {
    // console.log('getCardScore(' + player + ') = ', this.state.board.playerCards.find((p) => p.name === player).cards
    //   .map((card: Card) => card.getValue())
    //   .sort((v1, v2) => v1 - v2));
    return this.state.board.playerCards.find((p) => p.name === player).cards
      .map((card: Card) => card.getValue())
      .sort((v1, v2) => v1 - v2)
      .reduce((totalScore: number, currentValue: number, i, array) => {
        return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
      }, 0);
  }
  //#endregion Méthodes privées ---------------------------------------------------------
}

// const defaultFullBoardState: IFullBoardState = {
//   activePlayer: 'Joueur1',
//   board: {
//     deck: new Deck({}).getState(),
//     visibleCard: number;
//     visibleTokens: number;
//     playerCards: Array<{
//       name: string;
//       cards: number[];
//     }>;
//   };
//   playerTokens: Array<{
//     name: string;
//     hiddenTokens: number;
//   }>;
//   turn: number;
// };

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
