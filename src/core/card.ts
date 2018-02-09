/**
 * Error list:
 * - Error ('INVALID_CARD_VALUE')
 */
export default class Card {
  private value: number;

  constructor(value: number) {
    // Validation de la valeur
    if (value < 3 || value > 35) {
      throw new Error ('INVALID_CARD_VALUE');
    }
    this.value = value;
  }

  public getValue = (): number => this.value;
  public toString = (): string => this.value <= 9
    ? '│ ' + this.value + '│'
    : '│'  + this.value + '│'
  public clone = (): Card => new Card(this.value);
}
