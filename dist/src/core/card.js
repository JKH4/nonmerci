"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Error list:
 * - Error ('INVALID_CARD_VALUE')
 */
class Card {
    constructor(value) {
        this.getValue = () => this.value;
        this.toString = () => this.value <= 9
            ? '│ ' + this.value + '│'
            : '│' + this.value + '│';
        this.clone = () => new Card(this.value);
        // Validation de la valeur
        if (!value || value < 3 || value > 35) {
            throw new Error('INVALID_CARD_VALUE');
        }
        this.value = value;
    }
}
exports.default = Card;
//# sourceMappingURL=card.js.map