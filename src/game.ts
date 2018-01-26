import BoardState from './board-state';

/**
 * Error List:
 * - Error ('INVALID_NUMBER_OF_PLAYERS')
 * - Error ('INVALID_GAME_STATUS')
 */
export default class Game {
  //#region Propriétés internes #########################################################
  private status: GameStatus;
  private currentTurn: number;
  private currentBoardState: BoardState;
  private players: string[];
  private defaultOptions: IGameOptions = {
    players: ['Joueur1', 'Joueur2', 'Joueur3'],
  };
  //#endregion Propriétés internes ------------------------------------------------------

  constructor(options?: IGameOptions) {
    // Extraction des options par clonage ou par défaut
    const optionsCopy: IGameOptions = options
      ? JSON.parse(JSON.stringify(options))
      : this.defaultOptions;

    // Validation des options
    if (optionsCopy.players.length < 3 || optionsCopy.players.length > 5) {
      throw new Error ('INVALID_NUMBER_OF_PLAYERS');
    }

    // Prise en compte des options
    this.players = optionsCopy.players; // || ['Joueur1', 'Joueur2'];

    // Initialisation de la Game
    this.status = GameStatus.Created;
  }

  //#region Getters #####################################################################
  public getStatus = (): string => this.status;
  public getPlayers = (): string[] => this.players;
  public getCurrentTurn = (): number => this.currentTurn;
  public getBoardState = (): BoardState => this.currentBoardState;
  //#endregion Getters ------------------------------------------------------------------

  //#region Actions #####################################################################
  public start() {
    if (this.status === GameStatus.Created) {
      this.status = GameStatus.OnGoing;
      this.currentTurn = 1;
      this.currentBoardState = new BoardState(this.players);
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }

  public terminate() {
    if (this.status === GameStatus.OnGoing) {
      this.status = GameStatus.Terminated;
      this.currentBoardState = undefined;
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }

  public playNextTurn(action?: GameAction) {
    if (this.status === GameStatus.OnGoing) {
      if (action === GameAction.Pay) {
        try {
          this.getBoardState().pay();
        } catch (err) {
          throw err;
        }
      } else {
        // action par défaut
        this.getBoardState().take();
      }
      this.getBoardState().switchActivePlayer(this.getPlayers());
      this.currentTurn += 1;
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }
  //#endregion Actions ------------------------------------------------------------------
}

//#region Types et Interfaces annexes ###################################################
export enum GameStatus {
  Created = 'Created',
  OnGoing = 'OnGoing',
  Terminated = 'Terminated',
}

export enum GameAction {
  Pay = 'Pay',
  Take = 'Take',
}

export interface IGameOptions {
  players: [string];
}
//#endregion Types et Interfaces annexes ################################################
