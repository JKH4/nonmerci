import Card from '../../src/core/card';

describe('Manipuler une carte:', () => {
  it('Créé une carte de valeur 3', () => {
    expect(new Card(3).getValue()).toEqual(3);
  });

  it('Echoue à créer une carte de valeur 2', () => {
    expect(() => new Card(2)).toThrowError('INVALID_CARD_VALUE');
  });

  it('Echoue à créer une carte de valeur 36', () => {
    expect(() => new Card(36)).toThrowError('INVALID_CARD_VALUE');
  });
});
