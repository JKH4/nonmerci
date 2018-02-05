import Card from '../../src/core/card';
import Deck from '../../src/core/deck';

describe('Manipuler un deck:', () => {
  it('Initialise un deck avec 0 cartes', () => {
    const deck = new Deck(0);
    expect(deck.getSize()).toEqual(0);
    expect(() => deck.drawNextCard()).toThrowError('EMPTY_DECK');
  });

  it('Initialise un deck avec 24 cartes', () => {
    const deck = new Deck(24);
    expect(deck.getSize()).toEqual(24);
  });

  it('Mélange le deck à l\'initialisation', () => {
    const deck = new Deck(24);
    const card1 = deck.drawNextCard();
    const card2 = deck.drawNextCard();
    const card3 = deck.drawNextCard();
    const card4 = deck.drawNextCard();
    const equart1 = Math.abs(card1.getValue() - card2.getValue());
    const equart2 = Math.abs(card2.getValue() - card3.getValue());
    const equart3 = Math.abs(card3.getValue() - card4.getValue());
    expect(equart1 + equart2 + equart3).not.toEqual(3);
  });

  it('Tire une carte quand le deck n\'est pas vide', () => {
    const deck = new Deck(24);
    expect(deck.drawNextCard()).toEqual(jasmine.any(Card));
    expect(deck.getSize()).toEqual(23);
  });

  it('Echoue à tirer une carte quand le deck est vide', () => {
    const deck = new Deck(0);
    expect(() => deck.drawNextCard()).toThrowError('EMPTY_DECK');
    // expect(deck.getSize()).toEqual(23);
  });
});
