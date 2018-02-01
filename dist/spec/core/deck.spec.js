"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const card_1 = require("../../src/card");
const deck_1 = require("../../src/deck");
describe('Manipuler un deck:', () => {
    it('Initialise un deck avec 0 cartes', () => {
        const deck = new deck_1.default(0);
        expect(deck.getSize()).toEqual(0);
        expect(() => deck.drawNextCard()).toThrowError('EMPTY_DECK');
    });
    it('Initialise un deck avec 24 cartes', () => {
        const deck = new deck_1.default(24);
        expect(deck.getSize()).toEqual(24);
    });
    it('Mélange le deck à l\'initialisation', () => {
        const deck = new deck_1.default(24);
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
        const deck = new deck_1.default(24);
        expect(deck.drawNextCard()).toEqual(jasmine.any(card_1.default));
        expect(deck.getSize()).toEqual(23);
    });
});
//# sourceMappingURL=deck.spec.js.map