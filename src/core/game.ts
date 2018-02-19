import Board from './board';

/**
 * Error List:
 * - Error ('INVALID_NUMBER_OF_PLAYERS')
 * - Error ('INVALID_GAME_STATUS')
 * - Error ('END_OF_GAME')
 */
export default class Game {
  //#region Propriétés internes #########################################################
  private status: GameStatus;
  // private currentTurn: number;
  private board: Board;
  private players: string[];
  private defaultOptions: IGameOptions = {
    players: ['Joueur1', 'Joueur2', 'Joueur3'],
  };
  private scores: Array<[string, number]>;
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
  // public getCurrentTurn = (): number => this.currentTurn;
  public getBoard = (): Board => this.board;
  public getScores = (): Array<[string, number]> => this.scores;
  //#endregion Getters ------------------------------------------------------------------

  //#region Actions #####################################################################
  public start() {
    if (this.status === GameStatus.Created) {
      this.status = GameStatus.OnGoing;
      // this.currentTurn = 1;
      this.board = new Board({ players: this.players });
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }

  public terminate() {
    if (this.status === GameStatus.OnGoing) {
      this.scores = [];
      this.getPlayers().forEach((player) => {
        this.scores.push([player, this.getBoard().getPlayerScore(player)]);
      });
      this.scores.sort((s1: [string, number], s2: [string, number]) => s1[1] - s2[1]);

      this.status = GameStatus.Terminated;
      this.board = undefined;
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }

  public playNextTurn(action?: GameAction) {
    if (this.status === GameStatus.OnGoing) {
      if (action === GameAction.Pay) {
        try {
          this.getBoard().pay();
        } catch (err) {
          throw err;
        }
        this.getBoard().switchActivePlayer();
      } else {
        // action par défaut
        try {
          this.getBoard().take();
          this.getBoard().revealNewCard();
        } catch (e) {
          const err: Error = e;
          if (err.message === 'END_OF_GAME') {
            this.terminate();
            throw err;
          }
        }
      }
      this.getBoard().incrementTurn();
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
  players: string[];
}
//#endregion Types et Interfaces annexes ################################################
