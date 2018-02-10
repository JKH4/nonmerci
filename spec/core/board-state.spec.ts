import Board, { IBoardState, IPlayerBoardState } from '../../src/core/board-state';
import Card from '../../src/core/card';
import Deck from '../../src/core/deck';

fdescribe('Gestion du plateau', () => {
  // **************************************************************************************
  describe('Initialiser le plateau de jeu:', () => {
    let board: Board;

    it('Renvoie une erreur si on tente d\'initialiser le plateau sans joueur', () => {
      expect(() => board = new Board([])).toThrowError('INVALID_NUMBER_OF_PLAYER');
    });

    it('Renvoie une erreur si on tente d\'initialiser le plateau avec + de 5 joueurs', () => {
      expect(() => board = new Board(['j1', 'j2', 'j3', 'j4', 'j5', 'j6']))
        .toThrowError('INVALID_NUMBER_OF_PLAYER');
    });
  });

  describe('Accéder aux informations du plateau de jeu vu par un joueur:', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board(['Anna', 'Bob', 'David']);
    });

    it('Récupère l\'état d\'un joueur', () => {
      const playerState: IPlayerBoardState = board.getPlayerState();
      expect(typeof playerState).toBe('object');
      expect(playerState).not.toBeUndefined();
    });

    it('Récupère l\'état du joueur actif si pas de joueur précisé', () => {
      const playerState: IPlayerBoardState = board.getPlayerState();
      expect(playerState.activePlayer).toEqual('Anna');
      expect(playerState.privateData.playerName).toEqual('Anna');
    });

    it('Récupère l\'état du joueur spécifié', () => {
      const playerState: IPlayerBoardState = board.getPlayerState('David');
      expect(playerState.activePlayer).toEqual('Anna');
      expect(playerState.privateData.playerName).toEqual('David');
    });

    it('Echoue à accèder aux infos du joueur erronné', () => {
      expect(() => board.getPlayerState('Toto')).toThrowError('INVALID_PLAYER');
    });

    it('Accède aux infos privées du joueur via l\'état du joueur', () => {
      const playerState: IPlayerBoardState = board.getPlayerState();
      expect(playerState.privateData.playerName).toEqual('Anna');
      expect(playerState.privateData.hiddenTokens).toEqual(11);
      expect(playerState.privateData.currentScore).toEqual(0 - 11);
    });

    it('Accède aux infos du plateau via l\'état du joueur', () => {
      const playerState: IPlayerBoardState = board.getPlayerState();
      expect(playerState.board.visibleCard).toEqual(jasmine.any(Card));
      expect(playerState.board.deckSize).toEqual(24 - 1);
      expect(playerState.board.visibleTokens).toEqual(0);
      expect(playerState.board.playerCards).toEqual([
        {name: 'Anna', cards: [] }, {name: 'Bob', cards: [] }, {name: 'David', cards: [] }]);
    });

    it('Accède au tour courrant via via l\'état du joueur', () => {
      const playerState: IPlayerBoardState = board.getPlayerState();
      expect(playerState.turn).toEqual(1);
    });
  });

  describe('Accéder aux informations complètes du plateau de jeu:', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board(['Anna', 'Bob', 'David']);
    });

    it('Récupère l\'état complet du plateau', () => {
      const boardState: IBoardState = board.getState();
      expect(typeof boardState).toBe('object');
      expect(boardState).not.toBeUndefined();
    });

    it('Accède à ... via l\'état complet du plateau', () => {
      const boardState: IBoardState = board.getState();
      expect(boardState).not.toBe(board.getState());
      boardState.playerTokens = [];
      expect(boardState.playerTokens).not.toEqual(board.getState().playerTokens);
      expect('test non implémenté').toEqual('Test implémenté');
    });
  });

  describe('Valider l\'intégrité de l\'état du plateau de jeu:', () => {
    let board: Board;

    beforeEach(() => {
      board = new Board(['Anna', 'Bob', 'David']);
    });

  //   it('Créé par défaut un plateau de jeu avec 24 cartes différentes:', () => {
  //     try {
  //       while (1) { board.take(); }
  //     } catch (e) {
  //       const err: Error = e;
  //       const visibleBoardState = board.getPlayerState();

  //       const deckSize = visibleBoardState.deck.deckSize;
  //       const visibleCard = visibleBoardState.deck.visibleCard;
  //       const playerCards = visibleBoardState.activePlayer.cards;
  //       const cardValues = playerCards.map((card) => card.getValue());
  //       const filteredValues = [... new Set(cardValues)];

  //       expect(err.message).toEqual('END_OF_GAME');
  //       expect(playerCards.length).toEqual(24);
  //       expect(filteredValues.length).toEqual(24);
  //       expect(deckSize).toEqual(0);
  //       expect(visibleCard).toBeUndefined();
  //     }
  //   });

  //   it('Conserve le nombre de jeton à 11 x nb joueur en jeu après une action', () => {
  //     const initTotalTokens = board.getPlayerState().controlData.totalTokens;
  //     board.take();
  //     board.switchActivePlayer();
  //     expect(initTotalTokens).toEqual(board.getPlayerState().controlData.totalTokens);
  //     board.pay();
  //     board.switchActivePlayer();
  //     expect(initTotalTokens).toEqual(board.getPlayerState().controlData.totalTokens);
  //   });

  //   it('Créé un plateau de jeu avec le deck éventuellement fourni:', () => {
  //     const fixedBoard = new Board(
  //       ['Anna', 'Bob', 'David'],
  //       new Deck(0, [new Card(3), new Card(5), new Card(10)]),
  //     );
  //     expect(fixedBoard.getPlayerState().deck.deckSize).toEqual(3 - 1 /*carte visible*/);
  //     try {
  //       while (1) { fixedBoard.take(); }
  //     } catch (e) {
  //       const err: Error = e;
  //       expect(err.message).toEqual('END_OF_GAME');
  //       const cards = fixedBoard.getPlayerState().activePlayer.cards;
  //       expect(cards.length).toEqual(3);
  //       expect(cards.map((c) => c.getValue())).toContain(3);
  //       expect(cards.map((c) => c.getValue())).toContain(5);
  //       expect(cards.map((c) => c.getValue())).toContain(10);
  //       expect(cards.map((c) => c.getValue())).not.toContain(4);
  //     }
  //   });
  // });

  // // **************************************************************************************
  // describe('Résoudre les actions de jeu:', () => {
  //   let board: Board;

  //   beforeEach(() => {
  //     board = new Board(['Anna', 'Bob', 'David']);
  //   });

  //   it('Résoud l\'action PAY en transférant un jeton de la réserve du joueur actif vers le tas', () => {
  //     const visibleBoardState = board.getPlayerState();
  //     const player = visibleBoardState.activePlayer.name;
  //     const card = visibleBoardState.deck.visibleCard;
  //     const playerTokens = visibleBoardState.activePlayer.tokens;
  //     const cardTokens = visibleBoardState.deck.visibleCardTokens;

  //     expect(() => board.pay()).not.toThrowError();
  //     const newBoardState = board.getPlayerState();

  //     expect(newBoardState.activePlayer.tokens).toEqual(playerTokens - 1);
  //     expect(newBoardState.deck.visibleCardTokens).toEqual(cardTokens + 1);
  //     expect(newBoardState.activePlayer.cards.indexOf(card)).toEqual(-1);
  //     expect(newBoardState.deck.visibleCard).toEqual(card);
  //   });

  //   it('Résoud l\'action TAKE en transférant la carte visible et les jetons du tas au joueur actif', () => {
  //     const visibleBoardState = board.getPlayerState();
  //     const player = visibleBoardState.activePlayer.name;
  //     const card = visibleBoardState.deck.visibleCard;
  //     const playerTokens = visibleBoardState.activePlayer.tokens;
  //     const cardTokens = visibleBoardState.deck.visibleCardTokens;

  //     expect(() => board.take()).not.toThrowError();
  //     const newBoardState = board.getPlayerState();

  //     expect(newBoardState.activePlayer.tokens).toEqual(playerTokens + cardTokens);
  //     expect(newBoardState.deck.visibleCardTokens).toEqual(0);
  //     expect(newBoardState.activePlayer.cards.filter((c) => c === card).length).toEqual(1);
  //     expect(newBoardState.deck.visibleCard).not.toBe(card);
  //   });

  //   it('Signale la fin de la partie s\'il n\'y a plus de carte dans le deck après une action TAKE:', () => {
  //     while (board.getPlayerState().deck.deckSize > 0) {
  //       expect(() => board.take()).not.toThrowError();
  //     }
  //     expect(() => board.take()).toThrowError('END_OF_GAME');
  //     const newBoardState = board.getPlayerState();

  //     expect(newBoardState.deck.deckSize).toEqual(0);
  //     expect(newBoardState.deck.visibleCard).toBeUndefined();
  //   });

  //   it('Echoue à résoudre l\'action PAY si le joueur actif n\'a pas de jeton:', () => {
  //     while (board.getPlayerState().activePlayer.tokens > 0) {
  //       expect(() => board.pay()).not.toThrowError();
  //     }
  //     expect(board.getPlayerState().activePlayer.tokens).toEqual(0);
  //     expect(() => board.pay()).toThrowError('NOT_ENOUGH_TOKENS');
  //   });

  //   it('Echoue à résoudre une action PAY ou TAKE s\'il n\'y a plus de carte dans le deck:', () => {
  //     while (board.getPlayerState().deck.deckSize > 0) {
  //       expect(() => board.take()).not.toThrowError();
  //     }
  //     expect(() => board.take()).toThrowError('END_OF_GAME');

  //     expect(() => board.pay()).toThrowError('NO_MORE_CARD');
  //     expect(() => board.take()).toThrowError('NO_MORE_CARD');
  //   });

  //   it('Ne propose plus de carte visible après qu\'un joueur ai pris (TAKE) la dernière carte:', () => {
  //     while (board.getPlayerState().deck.deckSize > 0) {
  //       expect(() => board.take()).not.toThrowError();
  //     }
  //     expect(() => board.take()).toThrowError('END_OF_GAME');
  //     const newBoardState = board.getPlayerState();

  //     expect(newBoardState.deck.visibleCard).toBeUndefined();
  //   });
  // });

  // // **************************************************************************************
  // describe('Calculer le score d\'un joueur:', () => {
  //   let board: Board;

  //   beforeEach(() => {
  //     board = new Board(['Anna', 'Bob', 'David']);
  //   });

  //   it('Donne un score final de -11 à un joueur qui n\'a aucune carte dans sa pile et 11 jetons:', () => {
  //     const playerScore = board.getPlayerState().activePlayer.currentScore;
  //     expect(playerScore).toEqual(-11);
  //   });

  //   it('Donne un score final de -9 à un joueur qui seulement la carte 3 dans sa pile et 11 jetons:', () => {
  //     const fixedBoard = new Board(['Anna', 'Bob', 'David'], new Deck(0, [new Card(3)]));
  //     expect(() => fixedBoard.take()).toThrowError('END_OF_GAME');
  //     const playerScore = fixedBoard.getPlayerState().activePlayer.currentScore;
  //     expect(playerScore).toEqual(3 - 11);
  //   });

  //   it('Donne un score final de 19 à un joueur qui a les cartes 5, 25 et 26 dans sa pile et 11 jetons:', () => {
  //     // spyOn(board, 'getCurrentPlayerCardPiles').and.callFake(() => [new Card(5), new Card(25), new Card(26)]);
  //     // spyOn(board, 'getCurrentPlayerTokenPile').and.callFake(() => 3);
  //     const fixedBoard = new Board(
  //       ['Anna', 'Bob', 'David'],
  //       new Deck(0, [new Card(5), new Card(25), new Card(26)]),
  //     );
  //     while (fixedBoard.getPlayerState().deck.deckSize > 0) {
  //       expect(() => fixedBoard.take()).not.toThrowError();
  //     }
  //     expect(() => fixedBoard.take()).toThrowError('END_OF_GAME');
  //     const playerScore = fixedBoard.getPlayerState().activePlayer.currentScore;
  //     expect(playerScore).toEqual(5 + 25 - 11);
  //   });
  });
});
