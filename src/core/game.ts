import Board from './board';
import BoardHelper, { ActionType } from './board-helper';

import { Logger, LoggerInstance, transports } from 'winston';

/**
 * Error List:
 * - Error ('INVALID_NUMBER_OF_PLAYERS')
 * - Error ('INVALID_GAME_STATUS')
 * - Error ('END_OF_GAME')
 */
export default class Game {
  //#region Propriétés internes #########################################################
  private gameId: string;
  // private logger: LoggerInstance;
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

    this.gameId = 'ID_' + (+ Math.floor(Math.random() * 1000000000) + '000000000' ).substr(0, 9);

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
      const initState = BoardHelper.initBoardState({ playerList: this.players });
      initState.gameId = this.gameId;
      this.board = new Board(initState, []);
      logger.log('info', this.gameId + '_START_' + this.getBoard().getCurrentPlayer());
      this.board.revealNewCard();
      logger.log('info', this.gameId + '_DRAWW_' + this.getBoard().getState().visibleCard);
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }

  public terminate() {
    if (this.status === GameStatus.OnGoing) {
      this.scores = this.getBoard().getScores();
      logger.log('info', this.gameId + '_ENDDD_' + this.scores);
      // this.getPlayers().forEach((player) => {
      //   this.scores.push([player, this.getBoard().getScores().find((p) => p.)]);
      // });
      // this.scores.sort((s1: [string, number], s2: [string, number]) => s1[1] - s2[1]);

      this.status = GameStatus.Terminated;
      this.board = undefined;
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }

  public playNextTurn(action?: ActionType) {
    if (this.status === GameStatus.OnGoing) {
      if (action === ActionType.PAY) {
        try {
          this.getBoard().pay();
          logger.log('info', this.gameId + '_PAYYY_' + this.getBoard().getCurrentPlayer());
        } catch (err) {
          throw err;
        }
        this.getBoard().switchActivePlayer();
      } else if (action === ActionType.TAKE || action === undefined) {
        // action par défaut
        try {
          this.getBoard().take();
          logger.log('info', this.gameId + '_TAKEE_' + this.getBoard().getCurrentPlayer());
          this.getBoard().revealNewCard();
          logger.log('info', this.gameId + '_DRAWW_' + this.getBoard().getState().visibleCard);
          // logger.log('info',
          //   'playNextTurn DRAW',
          //   {state: this.getBoard().getState(), history: this.getBoard().getHistory()});
        } catch (e) {
          const err: Error = e;
          if (err.message === 'END_OF_GAME') {
            this.terminate();
            throw err;
          }
        }
      } else {
        throw new Error('INVALID_PLAY_NEXT_TURN_ACTION_TYPE');
      }
      this.getBoard().incrementTurn();
    } else {
      throw new Error('INVALID_GAME_STATUS');
    }
  }
  //#endregion Actions ------------------------------------------------------------------
}

//#region Logger ########################################################################
const logger = new Logger({
  transports: [
    // new transports.Console(),
    // new transports.File ({
    //   filename: 'c:\\logs\\games.log',
    //   handleExceptions: true,
    //   humanReadableUnhandledException: true,
    // }),
  ],
});
//#endregion Logger ---------------------------------------------------------------------

//#region Types et Interfaces annexes ###################################################
export enum GameStatus {
  Created = 'Created',
  OnGoing = 'OnGoing',
  Terminated = 'Terminated',
}

// export enum GameAction {
//   Pay = 'Pay',
//   Take = 'Take',
// }

export interface IGameOptions {
  players: string[];
}
//#endregion Types et Interfaces annexes ------------------------------------------------
