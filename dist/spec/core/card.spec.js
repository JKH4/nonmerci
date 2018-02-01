"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const card_1 = require("../../src/card");
describe('Manipuler une carte:', () => {
    it('Créé une carte de valeur 3', () => {
        expect(new card_1.default(3).getValue()).toEqual(3);
    });
    it('Echoue à créer une carte de valeur 2', () => {
        expect(() => new card_1.default(2)).toThrowError('INVALID_CARD_VALUE');
    });
    it('Echoue à créer une carte de valeur 36', () => {
        expect(() => new card_1.default(36)).toThrowError('INVALID_CARD_VALUE');
    });
});
//# sourceMappingURL=card.spec.js.map