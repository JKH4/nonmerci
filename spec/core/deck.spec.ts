import Card from '../../src/core/card';
import Deck, { TDeckState } from '../../src/core/deck';

describe('Manipuler un deck:', () => {
  it('Initialise un deck avec 0 cartes', () => {
    const deck = new Deck({size: 0});
    expect(deck.getSize()).toEqual(0);
    expect(() => deck.drawNextCard()).toThrowError('EMPTY_DECK');
  });

  it('Initialise un deck avec 24 cartes', () => {
    const deck = new Deck({size: 24});
    expect(deck.getSize()).toEqual(24);
  });

  it('Mélange le deck à l\'initialisation', () => {
    const deck = new Deck({size: 24});
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
    const deck = new Deck({size: 24});
    expect(deck.drawNextCard()).toEqual(jasmine.any(Card));
    expect(deck.getSize()).toEqual(23);
  });

  it('Echoue à tirer une carte quand le deck est vide', () => {
    const deck = new Deck({size: 0});
    expect(() => deck.drawNextCard()).toThrowError('EMPTY_DECK');
    // expect(deck.getSize()).toEqual(23);
  });

  it('Clone le deck en conservant la taille du deck', () => {
    const deck24 = new Deck({size: 24});
    const clone24 = deck24.clone();
    const notClone24 = deck24;
    expect(clone24.getSize()).toEqual(deck24.getSize());
    expect(clone24).not.toBe(deck24);
    expect(notClone24).toBe(deck24);
    const deck10 = new Deck({size: 10});
    const clone10 = deck10.clone();
    const notClone10 = deck10;
    expect(clone10.getSize()).toEqual(deck10.getSize());
    expect(clone10).not.toBe(deck10);
    expect(notClone10).toBe(deck10);
  });

  it('Créé une copie des cartes lors du clonage', () => {
    // les cartes contenues dans chaque deck ont la meme valeur mais sont différentes
    const deck = new Deck({});
    const clone = deck.clone();
    const firstCard = deck.drawNextCard();
    const firstCloneCard = clone.drawNextCard();
    expect(firstCloneCard.getValue()).toEqual(firstCard.getValue());
    expect(firstCloneCard).not.toBe(firstCard);
  });

  it('N\'impacte pas le deck d\'origine lors d\'une action sur le deck cloné', () => {
    // si je fais une action sur l'un ça n'affecte pas l'autre
    const deck = new Deck({});
    const clone = deck.clone();
    const size = deck.getSize();
    const cloneSize = clone.getSize();
    clone.drawNextCard();
    expect(cloneSize).toEqual(size);
    expect(deck.getSize()).toEqual(size);
    expect(clone.getSize()).toEqual(cloneSize - 1);
  });

  it('Tire des cartes de même valeur dans le même ordre entre un deck et son clone', () => {
    // si je fais la meme action sur les deux, ça produit le même résultat
    const deck = new Deck({});
    const clone = deck.clone();

    while (deck.getSize() > 0) {
      const card = deck.drawNextCard();
      const cloneCard = clone.drawNextCard();
      expect(cloneCard.getValue()).toEqual(card.getValue());
      expect(cloneCard).not.toBe(card);
      expect(clone.getSize()).toEqual(deck.getSize());
    }
  });

  it('Récupère l\'état du deck', () => {
    const deck = new Deck({});
    const deckState: TDeckState = deck.getState();
    expect(deckState.length).toEqual(24);
    expect(deckState.every((v) => typeof v === 'number')).toBeTruthy();
    expect(deckState.every((v) => v >= 3)).toBeTruthy();
    expect(deckState.every((v) => v <= 35)).toBeTruthy();
  });

  it('Tire des cartes du deck dans l\'ordre indiqué par l\'état du deck', () => {
    const deck = new Deck({});
    const deckState: TDeckState = deck.getState();
    deckState.reverse().forEach((v) => expect(deck.drawNextCard().getValue()).toEqual(v));
    expect(deck.getSize()).toEqual(0);
  });
});
