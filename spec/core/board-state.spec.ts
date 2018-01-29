import BoardState from '../../src/board-state';
import Card from '../../src/card';
import Deck from '../../src/deck';

describe('Gestion du plateau', () => {
  // **************************************************************************************
  describe('Manipuler le plateau de jeu:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Créé par défaut un plateau de jeu avec 24 cartes différentes:', () => {
      const cards: Card[] = [];
      while (board.getCurrentDeckSize() > 0) {
        cards.push(board.getCurrentCard());
        board.take();
      }
      cards.push(board.getCurrentCard());
      const cardValues = cards.map((card) => card.getValue());
      const filteredValues = [... new Set(cardValues)];
      expect(filteredValues.length).toEqual(cards.length);
      expect(filteredValues.length).toEqual(24);
    });
  });

  // **************************************************************************************
  describe('Manipuler le tas de jetons du plateau:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Ajoute un jeton au tas de jeton du plateau de jeu:', () => {
      const bagSize = board.getCurrentTokenBagSize();
      board.addTokenToBag();
      expect(board.getCurrentTokenBagSize()).toEqual(bagSize + 1);
    });

    it('Retire un jeton au tas de jeton du plateau de jeu:', () => {
      const bagSize = board.getCurrentTokenBagSize();
      board.removeTokenFromBag();
      expect(board.getCurrentTokenBagSize()).toEqual(bagSize - 1);
    });
  });

  // **************************************************************************************
  describe('Résoudre les actions de jeu:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Résoud l\'action PAY en transférant un jeton de la réserve du joueur actif vers le tas', () => {
      const player = board.getActivePlayer();
      const card = board.getCurrentCard();
      const playerTokens = board.getCurrentPlayerTokenPile(player);
      const tokenBag = board.getCurrentTokenBagSize();
      expect(() => board.pay()).not.toThrowError();
      expect(board.getCurrentPlayerTokenPile(player)).toEqual(playerTokens - 1);
      expect(board.getCurrentTokenBagSize()).toEqual(tokenBag + 1);
      expect(board.getCurrentPlayerCardPiles(player).indexOf(card)).toEqual(-1);
      expect(board.getCurrentCard()).toEqual(card);
    });

    it('Résoud l\'action TAKE en transférant la carte visible et les jetons du tas au joueur actif', () => {
      const player = board.getActivePlayer();
      const card = board.getCurrentCard();
      const playerTokens = board.getCurrentPlayerTokenPile(player);
      const tokenBag = board.getCurrentTokenBagSize();
      expect(() => board.take()).not.toThrowError();
      expect(board.getCurrentPlayerTokenPile(player)).toEqual(playerTokens + tokenBag);
      expect(board.getCurrentTokenBagSize()).toEqual(0);
      expect(board.getCurrentPlayerCardPiles(player).indexOf(card)).toBeGreaterThan(-1);
      expect(board.getCurrentCard()).not.toBe(card);
    });

    it('Echoue à résoudre l\'action PAY si le joueur actif n\'a pas de jeton:', () => {
      spyOn(board, 'getCurrentPlayerTokenPile').and.callFake(() => 0);
      const player = board.getActivePlayer();
      const card = board.getCurrentCard();
      const playerTokens = board.getCurrentPlayerTokenPile(player);
      const tokenBag = board.getCurrentTokenBagSize();
      expect(() => board.pay()).toThrowError('NOT_ENOUGH_TOKENS');
      expect(board.getCurrentPlayerTokenPile(player)).toEqual(playerTokens);
      expect(board.getCurrentTokenBagSize()).toEqual(tokenBag);
      expect(board.getCurrentPlayerCardPiles(player).indexOf(card)).toEqual(-1);
      expect(board.getCurrentCard()).toEqual(card);
    });

    it('Echoue à résoudre une action PAY ou TAKE s\'il n\'y a plus de carte dans le deck:', () => {
      spyOn(board, 'getCurrentCard').and.callFake((): Card => null);
      expect(() => board.pay()).toThrowError('NO_MORE_CARD');
      expect(() => board.take()).toThrowError('NO_MORE_CARD');
    });

    it('Signale la fin de la partie s\'il n\'y a plus de carte dans le deck après une action TAKE:', () => {
      while (board.getCurrentDeckSize() >= 1) {
        board.take();
      }
      expect(() => board.take()).toThrowError('END_OF_GAME');
      expect(board.getCurrentDeckSize()).toEqual(0);
      expect(board.getCurrentCard()).toBeUndefined();
    });

    // it('Ne propose plus de carte visible après qu\'un joueur ai pris (TAKE) la dernière carte:', () => {
    //   expect(board.getCurrentCard()).toEqual(jasmine.any(Card));
    //   spyOnProperty(board, 'currentDeck').and.returnValue([]);
    //   board.take();
    //   expect(board.getCurrentCard()).toBeUndefined();
    // });
  });

  // **************************************************************************************
  describe('Calculer le score d\'un joueur:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Donne un score "cartes" de 0 à un joueur qui n\'a aucune carte dans sa pile:', () => {
      const player = board.getActivePlayer();
      expect(board.getCardScore(player)).toEqual(0);
    });

    it('Donne un score "cartes" de 3 à un joueur qui seulement la carte 3 dans sa pile:', () => {
      const player = board.getActivePlayer();
      spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(3)]);
      expect(board.getCardScore(player)).toEqual(3);
    });

    it('Donne un score "cartes" de 3 à un joueur qui seulement la suite de carte 3, 4, 5 dans sa pile:', () => {
      const player = board.getActivePlayer();
      spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(3), new Card(4), new Card(5)]);
      expect(board.getCardScore(player)).toEqual(3);
    });

    it('Donne un score "cartes" de 3 à un joueur qui seulement la suite de carte 5, 4, 3 dans sa pile:', () => {
      const player = board.getActivePlayer();
      spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(5), new Card(4), new Card(3)]);
      expect(board.getCardScore(player)).toEqual(3);
    });

    it('Donne un score "cartes" de 8 à un joueur qui seulement les cartes 3 et 5 dans sa pile:', () => {
      const player = board.getActivePlayer();
      spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(3), new Card(5)]);
      expect(board.getCardScore(player)).toEqual(8);
    });

    it('Donne un score final de -11 à un joueur qui n\'a aucune carte dans sa pile et 11 jetons:', () => {
      const player = board.getActivePlayer();
      expect(board.getFinalScore(player)).toEqual(-11);
    });

    it('Donne un score final de -9 à un joueur qui seulement la carte 3 dans sa pile et 11 jetons:', () => {
      const player = board.getActivePlayer();
      spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(3)]);
      expect(board.getFinalScore(player)).toEqual(3 - 11);
    });

    it('Donne un score final de 27 à un joueur qui a les cartes 5, 25 et 26 dans sa pile et 11 jetons:', () => {
      const player = board.getActivePlayer();
      spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(5), new Card(25), new Card(26)]);
      spyOn(board, 'getCurrentPlayerTokenPile').and.callFake(() => 3);
      expect(board.getFinalScore(player)).toEqual(5 + 25 - 3);
    });
  });
});
