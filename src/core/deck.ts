import Card from './card';
/**
 * Error list:
 * - Error ('EMPTY_DECK')
 */
export default class Deck {
  private deck: Card[];

  constructor(options: {
    cardValues?: number[],
    // cards?: Card[],
    size?: number,
  }) {
    if (options.cardValues) {
      this.deck = options.cardValues.map((v) => new Card(v));
    // } else if (options.cards) {
    //   this.deck = options.cards;
    } else {
      const allCards = [];
      for (let i = 3; i < 36; i++) {
        allCards.push(new Card(i));
      }
      this.shuffle(allCards);
      const deckSize = options.size !== undefined ? options.size : 24;
      // const minValue = 3;
      this.deck = [];
      for (let i = 0; i < deckSize; i++) {
        this.deck.push(allCards.pop());
      }
    }
  }

  public getSize = () => this.deck.length;

  public drawNextCard() {
    if (this.getSize() === 0) {
      throw new Error('EMPTY_DECK');
    } else {
      return this.deck.pop();
    }
  }

  public clone(): Deck {
    // const cloneDeck = this.deck.map((c) => c.clone());
    return new Deck({size: 0, cardValues: this.deck.map((c) => c.getValue())});
  }

  public getState(): TDeckState {
    return this.deck.map((c) => c.getValue());
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

export type TDeckState = number[];
