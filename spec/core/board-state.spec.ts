import BoardState, { ICurrentBoardState } from '../../src/core/board-state';
import Card from '../../src/core/card';
import Deck from '../../src/core/deck';

describe('Gestion du plateau', () => {
  // **************************************************************************************
  describe('Accéder aux informations du plateau de jeu:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Récupère l\'état courrant et visible du plateau de jeu', () => {
      const currentBoardState: ICurrentBoardState = board.getCurrentBoardState();
      expect(typeof currentBoardState).toBe('object');
      expect(currentBoardState).not.toBeUndefined();
    });

    it('Accède aux infos du joueur actif via l\'état courrant et visible du plateau de jeu', () => {
      const currentBoardState: ICurrentBoardState = board.getCurrentBoardState();
      expect(currentBoardState.activePlayer.name).toEqual('Anna');
      expect(currentBoardState.activePlayer.tokens).toEqual(11);
      expect(currentBoardState.activePlayer.cards).toEqual([]);
      expect(currentBoardState.activePlayer.currentScore).toEqual(-11);
    });

    it('Accède aux infos du deck via l\'état courrant et visible du plateau de jeu', () => {
      const currentBoardState: ICurrentBoardState = board.getCurrentBoardState();
      expect(currentBoardState.deck.visibleCard).toEqual(jasmine.any(Card));
      expect(currentBoardState.deck.deckSize).toEqual(24 - 1);
      expect(currentBoardState.deck.visibleCardTokens).toEqual(0);
    });

    it('Accède aux infos des autres joueurs via l\'état courrant et visible du plateau de jeu', () => {
      const currentBoardState: ICurrentBoardState = board.getCurrentBoardState();
      expect(currentBoardState.otherPlayers).toEqual([{ name: 'Bob', cards: [] }, { name: 'David', cards: []}]);
    });
  });

  describe('Valider l\'intégrité de l\'état du plateau de jeu:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Créé par défaut un plateau de jeu avec 24 cartes différentes:', () => {
      try {
        while (1) { board.take(); }
      } catch (e) {
        const err: Error = e;
        const visibleBoardState = board.getCurrentBoardState();

        const deckSize = visibleBoardState.deck.deckSize;
        const visibleCard = visibleBoardState.deck.visibleCard;
        const playerCards = visibleBoardState.activePlayer.cards;
        const cardValues = playerCards.map((card) => card.getValue());
        const filteredValues = [... new Set(cardValues)];

        expect(err.message).toEqual('END_OF_GAME');
        expect(playerCards.length).toEqual(24);
        expect(filteredValues.length).toEqual(24);
        expect(deckSize).toEqual(0);
        expect(visibleCard).toBeUndefined();
      }
    });
  });

  // **************************************************************************************
  describe('Résoudre les actions de jeu:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Résoud l\'action PAY en transférant un jeton de la réserve du joueur actif vers le tas', () => {
      const visibleBoardState = board.getCurrentBoardState();
      const player = visibleBoardState.activePlayer.name;
      const card = visibleBoardState.deck.visibleCard;
      const playerTokens = visibleBoardState.activePlayer.tokens;
      const cardTokens = visibleBoardState.deck.visibleCardTokens;

      expect(() => board.pay()).not.toThrowError();
      const newBoardState = board.getCurrentBoardState();

      expect(newBoardState.activePlayer.tokens).toEqual(playerTokens - 1);
      expect(newBoardState.deck.visibleCardTokens).toEqual(cardTokens + 1);
      expect(newBoardState.activePlayer.cards.indexOf(card)).toEqual(-1);
      expect(newBoardState.deck.visibleCard).toEqual(card);
    });

    it('Résoud l\'action TAKE en transférant la carte visible et les jetons du tas au joueur actif', () => {
      const visibleBoardState = board.getCurrentBoardState();
      const player = visibleBoardState.activePlayer.name;
      const card = visibleBoardState.deck.visibleCard;
      const playerTokens = visibleBoardState.activePlayer.tokens;
      const cardTokens = visibleBoardState.deck.visibleCardTokens;

      expect(() => board.take()).not.toThrowError();
      const newBoardState = board.getCurrentBoardState();

      expect(newBoardState.activePlayer.tokens).toEqual(playerTokens + cardTokens);
      expect(newBoardState.deck.visibleCardTokens).toEqual(0);
      expect(newBoardState.activePlayer.cards.filter((c) => c === card).length).toEqual(1);
      expect(newBoardState.deck.visibleCard).not.toBe(card);
    });

    it('Signale la fin de la partie s\'il n\'y a plus de carte dans le deck après une action TAKE:', () => {
      while (board.getCurrentBoardState().deck.deckSize > 0) {
        expect(() => board.take()).not.toThrowError();
      }
      expect(() => board.take()).toThrowError('END_OF_GAME');
      const newBoardState = board.getCurrentBoardState();

      expect(newBoardState.deck.deckSize).toEqual(0);
      expect(newBoardState.deck.visibleCard).toBeUndefined();
    });

    it('Echoue à résoudre l\'action PAY si le joueur actif n\'a pas de jeton:', () => {
      while (board.getCurrentBoardState().activePlayer.tokens > 0) {
        expect(() => board.pay()).not.toThrowError();
      }
      expect(board.getCurrentBoardState().activePlayer.tokens).toEqual(0);
      expect(() => board.pay()).toThrowError('NOT_ENOUGH_TOKENS');
    });

    it('Echoue à résoudre une action PAY ou TAKE s\'il n\'y a plus de carte dans le deck:', () => {
      while (board.getCurrentBoardState().deck.deckSize > 0) {
        expect(() => board.take()).not.toThrowError();
      }
      expect(() => board.take()).toThrowError('END_OF_GAME');

      expect(() => board.pay()).toThrowError('NO_MORE_CARD');
      expect(() => board.take()).toThrowError('NO_MORE_CARD');
    });

    it('Ne propose plus de carte visible après qu\'un joueur ai pris (TAKE) la dernière carte:', () => {
      while (board.getCurrentBoardState().deck.deckSize > 0) {
        expect(() => board.take()).not.toThrowError();
      }
      expect(() => board.take()).toThrowError('END_OF_GAME');
      const newBoardState = board.getCurrentBoardState();

      expect(newBoardState.deck.visibleCard).toBeUndefined();
    });
  });

  // **************************************************************************************
  describe('Calculer le score d\'un joueur:', () => {
    let board: BoardState;

    beforeEach(() => {
      board = new BoardState(['Anna', 'Bob', 'David']);
    });

    it('Donne un score final de -11 à un joueur qui n\'a aucune carte dans sa pile et 11 jetons:', () => {
      const playerScore = board.getCurrentBoardState().activePlayer.currentScore;
      expect(playerScore).toEqual(-11);
    });

    it('Donne un score final de -9 à un joueur qui seulement la carte 3 dans sa pile et 11 jetons:', () => {
      const fixedBoard = new BoardState(['Anna', 'Bob', 'David'], new Deck(0, [new Card(3)]));
      expect(() => fixedBoard.take()).toThrowError('END_OF_GAME');
      const playerScore = fixedBoard.getCurrentBoardState().activePlayer.currentScore;
      expect(playerScore).toEqual(3 - 11);
    });

    it('Donne un score final de 19 à un joueur qui a les cartes 5, 25 et 26 dans sa pile et 11 jetons:', () => {
      // spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(5), new Card(25), new Card(26)]);
      // spyOn(board, 'getCurrentPlayerTokenPile').and.callFake(() => 3);
      const fixedBoard = new BoardState(
        ['Anna', 'Bob', 'David'],
        new Deck(0, [new Card(5), new Card(25), new Card(26)]),
      );
      while (fixedBoard.getCurrentBoardState().deck.deckSize > 0) {
        expect(() => fixedBoard.take()).not.toThrowError();
      }
      expect(() => fixedBoard.take()).toThrowError('END_OF_GAME');
      const playerScore = fixedBoard.getCurrentBoardState().activePlayer.currentScore;
      expect(playerScore).toEqual(5 + 25 - 11);
    });
  });
});
