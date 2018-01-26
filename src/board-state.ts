import Card from './card';
import { IGameOptions } from './game';

/**
 * Error list:
 * - Error ('NOT_ENOUGH_TOKENS')
 */
export default class BoardState {
  private currentCard: Card;
  private currentDeck: Card[];
  private currentTokenBag: number;
  private currentPlayerCardPiles: {
    [player: string]: Card[];
  };
  private currentPlayerTokenPiles: {
    [player: string]: number;
  };
  private activePlayer: string;

  constructor(players: string[]) {
    const allCards = [];
    for (let i = 3; i < 36; i++) {
      allCards.push(new Card(i));
    }
    this.shuffle(allCards);
    this.currentDeck = [];
    while (this.currentDeck.length < 24) {
      this.currentDeck.push(allCards.pop());
    }
    this.currentCard = this.currentDeck.pop();
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
  public getCurrentDeckSize = (): number => this.currentDeck.length;
  public getCurrentTokenBagSize = (): number => this.currentTokenBag;
  public getCurrentPlayerCardPiles = (player: string): Card[] => this.currentPlayerCardPiles[player];
  public getCurrentPlayerTokenPile = (player: string): number => this.currentPlayerTokenPiles[player];
  public getActivePlayer = (): string => this.activePlayer;

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
    } else {
      this.currentPlayerTokenPiles[this.activePlayer]--;
      this.addTokenToBag();
    }
  }

  public take() {
    this.currentPlayerTokenPiles[this.activePlayer] += this.currentTokenBag;
    this.currentTokenBag = 0;
    this.currentPlayerCardPiles[this.activePlayer].push(this.currentCard);
    this.currentCard = this.currentDeck.pop();
  }

  /**
   * Shuffles array in place. ES6 version
   * @param {Array} a items An array containing the items.
   * from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
   */
  private shuffle(a: any[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

}
