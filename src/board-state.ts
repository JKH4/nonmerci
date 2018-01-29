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

  constructor(players: string[]) {
    this.currentDeck = new Deck(24);
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

  public getCurrentCard = (): Card => this.currentCard;
  public getCurrentDeckSize = (): number => this.currentDeck.getSize();
  public getCurrentTokenBagSize = (): number => this.currentTokenBag;
  public getCurrentPlayerCardPiles = (player: string): Card[] => this.currentPlayerCardPiles[player];
  public getCurrentPlayerTokenPile = (player: string): number => this.currentPlayerTokenPiles[player];
  public getActivePlayer = (): string => this.activePlayer;

  public getCardScore(player: string): number {
    const score = this.getCurrentPlayerCardPiles(player)
      .map((card: Card) => card.getValue())
      .sort((v1, v2) => v1 - v2)
      .reduce((totalScore: number, currentValue: number, i, array) => {
        return totalScore + (array[i] === array[i - 1] + 1 ? 0 : currentValue);
      }, 0);
    return score;
  }

  public getFinalScore(player: string): number {
    return this.getCardScore(player) - this.getCurrentPlayerTokenPile(player);
  }

  public addTokenToBag() {
    this.currentTokenBag++;
  }

  public removeTokenFromBag() {
    this.currentTokenBag--;
  }

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
}
