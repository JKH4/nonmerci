import Card from './card';

const BoardHelper = {
  cloneState,
  getDefaultBoardState,
  initBoardState,
  listAvailableCards,
  listVisibleCards,
  validateBoardState,
  validateHistory,
};

export default BoardHelper;

function cloneState(state: IBoardState): IBoardState {
  return {
    ...state,
    players: state.players
      .map((p) => ( { name: p.name, cards: p.cards.map((c) => c), hiddenTokens: p.hiddenTokens }) ),
  };
}

function getDefaultBoardState(): IBoardState {
  return {
    activePlayer: 'Joueur1',
    deckSize: 24,
    players: [
      {name: 'Joueur1', cards: [], hiddenTokens: 11},
      {name: 'Joueur2', cards: [], hiddenTokens: 11},
      {name: 'Joueur3', cards: [], hiddenTokens: 11},
    ],
    turn: 0,
    visibleCard: undefined,
    visibleTokens: 0,
  };
}

function initBoardState(options?: {deckSize?: number, playerList?: string[]}): IBoardState {
  if (!options)             { options = {}; }
  if (!options.deckSize)    { options.deckSize = 24; }
  if (!options.playerList)  { options.playerList = ['Joueur1', 'Joueur2', 'Joueur3']; }

  if (options.playerList.length < 3 || options.playerList.length > 5) { throw new Error('INVALID_PLAYER_LIST'); }
  if (!options.playerList.every((p) => p.length > 0)) { throw new Error('INVALID_PLAYER_LIST'); }
  if (!Number.isInteger(options.deckSize) || options.deckSize < 0) { throw new Error('INVALID_DECK_SIZE'); }

  const boardState: IBoardState = {
    activePlayer: options.playerList[0],
    deckSize: options.deckSize,
    players: options.playerList.map((p) => ({ name: p, cards: [], hiddenTokens: 11 })),
    turn: 0,
    visibleCard: undefined,
    visibleTokens: 0,
  };
  return boardState;
}

function listAvailableCards(state: IBoardState): number[] {
  const visibleCards = listVisibleCards(state);
  const availableCards: number[] = [];
  for (let i = 3; i <= 35; i++) {
    if (!visibleCards.find((c) => c === i)) {
      availableCards.push(i);
    }
  }
  return availableCards;
}

function listVisibleCards(state: IBoardState): number[] {
  return [
    state.visibleCard,
    ...state.players
      .map((p) => p.cards)
      .reduce((prev, curr) => [...prev, ...curr], []),
  ].filter((x) => x !== undefined);
}

function validateBoardState(state: IBoardState) {
  // Joueurs ############################################################################
  // - activePlayer <> playerCards <> playerTokens
  if (state.players.find((p) => p.name === state.activePlayer) === undefined) {
    throw new Error('ACTIVE_PLAYER_NOT_IN_PLAYER_LIST');
  }

  // - playerCards/playerTokens entre 3 et 5
  if (state.players.length < 3 || state.players.length > 5) {
    throw new Error('INVALID_NUMBER_OF_PLAYER');
  }

  // Cartes #############################################################################
  // - toutes les cartes sont initialisables (visibleCard, Deck, playerCards)
  const allCardsValues = listVisibleCards(state);
  allCardsValues.map((v) => new Card(v)); // lève une erreur si pas initialisable

  // - pas de doublons (visibleCard, Deck, playerCards)
  if ([...new Set(allCardsValues)].length !== allCardsValues.length) {
    throw new Error('DUPLICATED_CARDS');
  }

  // Deck ###############################################################################
  // Aucun test

  // Tokens #############################################################################
  // - total tokens = 11 * nb joueurs
  const allTokens = state.visibleTokens
    + state.players
      .map(({name, cards, hiddenTokens}) => hiddenTokens)
      .reduce((prev, curr) => prev + curr, 0);
  if (allTokens !== (11 * state.players.length)) {
    throw new Error('INVALID_TOTAL_TOKENS');
  }

  // - visibleTokens = 0 si visibleCard = undefined
  if (state.visibleTokens && (state.visibleCard === undefined)) {
    throw new Error('VISIBLE_TOKENS_WITHOUT_VISIBLE_CARD');
  }

  // Turn ###############################################################################
  // - entier <= 0
  if (!Number.isInteger(state.turn) || state.turn < 0) {
    throw new Error('INVALID_TURN');
  }
}

function validateHistory(history: BoardHistory) {
  // Ordre des entrées ##################################################################
  // - Après un Take => Draw
  if (!history.every((line, i, arr) => line.type !== ActionType.TAKE ||
    (arr[i + 1] === undefined || arr[i + 1].type === ActionType.DRAW))) {
    throw new Error('TAKE_SHOULD_BE_FOLLOWED_BY_DRAW');
  }

  // - Après Draw => Take ou Pay
  if (!history.every((line, i, arr) => line.type !== ActionType.DRAW ||
    (arr[i + 1] === undefined || arr[i + 1].type === ActionType.PAY ||
      arr[i + 1].type === ActionType.TAKE))) {
    throw new Error('DRAW_SHOULD_BE_FOLLOWED_BY_GAMEACTION');
  }

  // - Après Pay => Take ou Pay
  if (!history.every((line, i, arr) => line.type !== ActionType.PAY ||
    (arr[i + 1] === undefined || arr[i + 1].type === ActionType.PAY ||
      arr[i + 1].type === ActionType.TAKE))) {
    throw new Error('PAY_SHOULD_BE_FOLLOWED_BY_GAMEACTION');
  }

  // Structure des entrées ##############################################################
  // - entrée action Draw : carte initialisable
  history
    .filter((line) => line.type === ActionType.DRAW)
    .forEach((line: IDraw) => new Card((line.payload)));

  // // Enchainement des lignes : CARTES ###################################################
  // - Pas 2 fois Draw X
  const draws = history
    .filter((line) => line.type === ActionType.DRAW)
    .map((line: IDraw) => line.payload);

  if (draws.length !== new Set(draws).size) {
    throw new Error('DUPLICATE_DRAWS');
  }
}

// function buildCurrentState(initState: IBoardState, history: BoardHistory): IBoardState {
//   validateBoardState(initState);
//   validateHistory(history);
//   const currentState = initState;
//   history.forEach((line) => {
//     // play action
//   });
//   return initState;
// }

export interface IBoardState {
  activePlayer: string;
  deckSize: number;
  visibleCard: number;
  visibleTokens: number;
  players: Array<{
    name: string;
    cards: number[];
    hiddenTokens: number;
  }>;
  turn: number;
}

export type BoardHistory = Array<IDraw | IGameAction>;

export interface IDraw {
  type: ActionType.DRAW;
  payload: number;
}

export interface IGameAction {
  type: ActionType.TAKE | ActionType.PAY;
}

export enum ActionType {
  DRAW = 'DRAW',
  TAKE = 'TAKE',
  PAY = 'PAY',
}

// export enum GameAction {
//   TAKE = 'TAKE',
//   PAY = 'PAY',
// }
