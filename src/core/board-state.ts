import Card from './card';
import Deck from './deck';
import { IGameOptions } from './game';

/**
 * Error list:
 * - Error ('NOT_ENOUGH_TOKENS')
 * - Error ('NO_MORE_CARD')
 * - Error ('END_OF_GAME')
 */
export default class BoardState {
  //#region Propriétés internes #########################################################
  private currentCard: Card;
  private currentDeck: Deck;
  private currentTokenBag: number;
  private currentPlayerCardPiles: {
    [player: string]: Card[];
  };
  private currentPlayerTokenPiles: {
    [player: string]: number;
  };
  private activePlayer: string;
  //#endregion Propriétés internes ------------------------------------------------------

  /***
   * Constructor
   */
  constructor(players: string[], deck?: Deck) {
    this.currentDeck = deck ? deck : new Deck(24);
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

  //#region Getters #####################################################################
  public getCurrentBoardState = (): ICurrentBoardState => {
    return {
      activePlayer: {
        cards: this.getCurrentPlayerCardPiles(this.activePlayer),
        currentScore: this.getFinalScore(this.activePlayer),
        name: this.activePlayer,
        tokens: this.getCurrentPlayerTokenPile(this.activePlayer),
      },
      deck: {
        deckSize: this.getCurrentDeckSize(),
        visibleCard: this.getCurrentCard(),
        visibleCardTokens: this.getCurrentTokenBagSize(),
      },
      otherPlayers: Object.keys(this.currentPlayerTokenPiles)
        .filter((player) => player !== this.activePlayer)
        .map((player) => ({ name: player, cards: this.getCurrentPlayerCardPiles(player) })),
    };
  }
  public getFinalScore(player: string): number {
    return this.getCardScore(player) - this.getCurrentPlayerTokenPile(player);
  }
  //#endregion Getters ------------------------------------------------------------------

  //#region Actions #####################################################################
  public switchActivePlayer(playerList: string[]) {
    if (playerList.indexOf(this.activePlayer) === playerList.length - 1) {
      this.activePlayer = playerList[0];
    } else {
      this.activePlayer = playerList[playerList.indexOf(this.activePlayer) + 1];
    }
  }

  public pay() {
    if (this.getCurrentPlayerTokenPile(this.activePlayer) <= 0) {
      throw new Error ('NOT_ENOUGH_TOKENS');
    } else if (!this.getCurrentCard()) {
      throw new Error ('NO_MORE_CARD');
    } else {
      this.currentPlayerTokenPiles[this.activePlayer]--;
      this.addTokenToBag();
    }
  }

  public take() {
    if (!this.getCurrentCard()) {
      throw new Error ('NO_MORE_CARD');
    } else {
      this.currentPlayerTokenPiles[this.activePlayer] += this.currentTokenBag;
      this.currentTokenBag = 0;
      this.currentPlayerCardPiles[this.activePlayer].push(this.currentCard);
      try {
        this.currentCard = this.currentDeck.drawNextCard();
      } catch (e) {
        const err: Error = e;
        if (err.message === 'EMPTY_DECK') {
          this.currentCard = undefined;
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
  private getCurrentCard = (): Card => this.currentCard;
  private getCurrentDeckSize = (): number => this.currentDeck.getSize();
  private getCurrentTokenBagSize = (): number => this.currentTokenBag;
  private getCurrentPlayerCardPiles = (player: string): Card[] => this.currentPlayerCardPiles[player];
  private getCurrentPlayerTokenPile = (player: string): number => this.currentPlayerTokenPiles[player];
  private getActivePlayer = (): string => this.activePlayer;
  private getCardScore(player: string): number {
    const score = this.getCurrentPlayerCardPiles(player)
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
  private addTokenToBag() {
    this.currentTokenBag++;
  }

  private removeTokenFromBag() {
    this.currentTokenBag--;
  }
  //#endregion Méthodes privées ---------------------------------------------------------

}

export interface ICurrentBoardState {
  activePlayer: {
    name: string;
    tokens: number;
    cards: Card[];
    currentScore: number;
  };
  deck: {
    visibleCard: Card;
    visibleCardTokens: number;
    deckSize: number;
  };
  otherPlayers: Array<{
    name: string;
    cards: Card[];
  }>;
}
