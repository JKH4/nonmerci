import Card from './card';
import Deck from './deck';
import { IGameOptions } from './game';

/**
 * Error list:
 * - Error ('INVALID_NUMBER_OF_PLAYER')
 * - Error ('INVALID_PLAYER')
 * - Error ('NOT_ENOUGH_TOKENS')
 * - Error ('NO_MORE_CARD')
 * - Error ('END_OF_GAME')
 */
export default class Board {
  //#region Propriétés internes #########################################################
  private state: IBoardState;
  // private turn: number;
  // private currentCard: Card;
  // private currentDeck: Deck;
  // private currentTokenBag: number;
  // private currentPlayerCardPiles: {
  //   [player: string]: Card[];
  // };
  // private currentPlayerTokenPiles: {
  //   [player: string]: number;
  // };
  // private activePlayer: string;
  //#endregion Propriétés internes ------------------------------------------------------

  /***
   * Constructor
   */
  constructor(players: string[], deck?: Deck) {
    if (players.length === 0 || players.length > 5) {
      throw new Error('INVALID_NUMBER_OF_PLAYER');
    }
    const temporaryDeck = deck ? deck : new Deck(24);
    this.state = {
      activePlayer: players[0],
      board: {
        deck: temporaryDeck,
        playerCards: players.map((p) => ({ name: p, cards: []})),
        visibleCard: temporaryDeck.drawNextCard(),
        visibleTokens: 0,
      },
      playerTokens: players.map((p) => ({ name: p, hiddenTokens: 11 })),
      turn: 1,
    };
    // this.turn = 1;
    // this.currentDeck = this.state.board.deck;
    // this.currentCard = this.state.board.visibleCard;
    // this.currentTokenBag = this.state.board.visibleTokens;
    // this.currentPlayerCardPiles = {};
    // this.currentPlayerTokenPiles = {};
    // players.forEach((player) => {
    //   this.currentPlayerCardPiles[player] = [];
    //   this.currentPlayerTokenPiles[player] = 11;
    // });
    // this.activePlayer = players[0];
  }

  //#region Getters #####################################################################
  public getPlayerState = (player?: string): IPlayerBoardState => {
    // const temp = this.state.board.playerCards
    //   .map(({name, cards}) => ({ name, cards: cards.map((c) => c.clone()) }));
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
          ...this.state.board.playerCards // Est ce qu'on veut cloner les cartes ici ?
            .map(({name, cards}) => ({ name, cards: cards.map((c) => c.clone()) })),
        ],
        visibleCard: this.state.board.visibleCard.clone(),
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

  public getState = (): IBoardState => {
    return {
      ...this.state, // Est ce qu'on veut deep cloner ici ?
    };
  }

  public getFinalScore(player: string): number {
    return this.getCardScore(player) - this.state.playerTokens.find((p) => p.name === player).hiddenTokens;
    // this.getCurrentPlayerTokenPile(player);
  }
  //#endregion Getters ------------------------------------------------------------------

  //#region Actions #####################################################################
  public incrementTurn() {
    this.state = {
      ...this.state,
      turn: this.state.turn++,
    };
  }

  public switchActivePlayer() {
    const playerList = Object.keys(this.state.playerTokens.map((p) => p.name));
    if (playerList.indexOf(this.state.activePlayer) === playerList.length - 1) {
      this.state.activePlayer = playerList[0];
    } else {
      this.state.activePlayer = playerList[playerList.indexOf(this.state.activePlayer) + 1];
    }
  }

  public pay() {
    // if (this.getCurrentPlayerTokenPile(this.state.activePlayer) <= 0) {
    if (this.state.playerTokens.find((p) => p.name === this.state.activePlayer).hiddenTokens <= 0) {
      throw new Error ('NOT_ENOUGH_TOKENS');
    // } else if (!this.getCurrentCard()) {
    } else if (!this.state.board.visibleCard) {
      throw new Error ('NO_MORE_CARD');
    } else {
      this.state = {
        ...this.state,
        board: {
          ...this.state.board,
          visibleTokens: this.state.board.visibleTokens++,
        },
        playerTokens: this.state.playerTokens
          .map(({ name, hiddenTokens }) => name === this.state.activePlayer
            ? { name, hiddenTokens: hiddenTokens-- }
            : { name, hiddenTokens }),
      };
      // this.currentPlayerTokenPiles[this.activePlayer]--;
      // this.addTokenToBag();
    }
  }

  public take() {
    // if (!this.getCurrentCard()) {
    if (!this.state.board.visibleCard) {
      throw new Error ('NO_MORE_CARD');
    } else {
      this.state = {
        ...this.state,
        board: {
          ...this.state.board,
          playerCards: this.state.board.playerCards.map(({ name, cards }) => name === this.state.activePlayer
            ? { name, cards: [...cards.map((c) => c.clone()), this.state.board.visibleCard.clone()] }
            : { name, cards }),
          visibleTokens: 0,
        },
        playerTokens: this.state.playerTokens.map(({ name, hiddenTokens }) => name === this.state.activePlayer
          ? { name, hiddenTokens: hiddenTokens + this.state.board.visibleTokens }
          : { name, hiddenTokens }),
      };
      // .currentPlayerTokenPiles[this.activePlayer] += this.currentTokenBag;
      // this.currentTokenBag = 0;
      // this.currentPlayerCardPiles[this.activePlayer].push(this.currentCard);
      try {
        // this.currentCard = this.currentDeck.drawNextCard();
        this.state = {
          ...this.state,
          board: {
            ...this.state.board,
            visibleCard: this.state.board.deck.drawNextCard(),
          },
        };
      } catch (e) {
        const err: Error = e;
        if (err.message === 'EMPTY_DECK') {
          // this.currentCard = undefined;
          this.state = {
            ...this.state,
            board: {
              ...this.state.board,
              visibleCard: undefined,
            },
          };
          throw new Error('END_OF_GAME');
        } else {
          throw e;
        }
      }
    }
  }
  //#endregion Actions ------------------------------------------------------------------

  //#region Méthodes privées ############################################################
  /**
   * Getters
   */
  // private getCurrentCard = (): Card => this.currentCard;
  // private getCurrentDeckSize = (): number => this.currentDeck.getSize();
  // private getCurrentTokenBagSize = (): number => this.currentTokenBag;
  // private getCurrentPlayerCardPiles = (player: string): Card[] => this.currentPlayerCardPiles[player];
  // private getCurrentPlayerTokenPile = (player: string): number => this.currentPlayerTokenPiles[player];
  // private getActivePlayer = (): string => this.activePlayer;
  private getCardScore(player: string): number {
    // const score = this.getCurrentPlayerCardPiles(player)
    const score = this.state.board.playerCards.find((p) => p.name === player).cards
      .map((card: Card) => card.getValue())
      .sort((v1, v2) => v1 - v2)
      .reduce((totalScore: number, currentValue: number, i, array) => {
        return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
      }, 0);
    return score;
  }

  /**
   * Actions
   */
  // private addTokenToBag() {
  //   this.currentTokenBag++;
  // }

  // private removeTokenFromBag() {
  //   this.currentTokenBag--;
  // }

  /**
   * Checks and Controls
   */
  // private getTotalTokens = (): number => this.currentTokenBag +
  //   Object.keys(this.currentPlayerTokenPiles)
  //     .map((k) => this.currentPlayerTokenPiles[k])
  //     .reduce((prev, curr) => prev + curr, 0)
  //#endregion Méthodes privées ---------------------------------------------------------

}

// export interface ICurrentBoardState {
//   activePlayer: {
//     name: string;
//     tokens: number;
//     cards: Card[];
//     currentScore: number;
//   };
//   deck: {
//     visibleCard: Card;
//     visibleCardTokens: number;
//     deckSize: number;
//   };
//   otherPlayers: Array<{
//     name: string;
//     cards: Card[];
//   }>;
//   controlData: {
//     totalTokens: number;
//     turn: number;
//   };
// }

export interface IBoardState {
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

export interface IPlayerBoardState {
  activePlayer: string;
  privateData: {
    playerName: string;
    currentScore: number;
    hiddenTokens: number;
  };
  board: {
    deckSize: number;
    visibleCard: Card;
    visibleTokens: number;
    playerCards: Array<{
      name: string;
      cards: Card[];
    }>;
  };
  turn: number;
}
