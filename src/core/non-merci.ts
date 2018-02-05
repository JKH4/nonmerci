/* tslint:disable:object-literal-sort-keys */
// import commander = require('commander');
import EventEmitter = require('events');
import readline = require('readline');
import Game, { GameAction, IGameOptions } from './game';

import Workflow, { IActionResult, IStep, StepType } from './../workflow/workflow';

export default class NomMerci {
  private state: IState = {
    playerNumberTemp: 0,
    options: {
      players: [],
    },
  };
  /************************************************************************************************
   * Constructor
   ************************************************************************************************/
  constructor() {
    // console.log('#####################################################################');
    // console.log('###############              NON MERCI               ################');
    // console.log('#####################################################################');
    // this.program = new commander();
  }

  /************************************************************************************************
   * Public methods
   ************************************************************************************************/
  public createNewGame(options?: IGameOptions): Game {
    // console.log(options);
    return new Game(options);
  }

  public main() {
    /////////////// INIT stepCollection
    const nmSteps = this.initSteps();

    /////////////// INIT Workflow
    const nonMerciWorkflow = new Workflow(nmSteps);

    /////////////// START
    nonMerciWorkflow.startWorkflow();
  }

  /************************************************************************************************
   * Privates methods
   ************************************************************************************************/
  private initSteps(): IStep[] {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askUser = (id: string, question: string, validation: (any), resolve: any, reject: any) => {
      rl.question(question, (answer) => validation(answer)
        ? resolve({ id, res: answer })
        : reject(new Error('Réponse invalide: ' + answer)));
    };

    const stepChoose: IStep = {
      id: 'stepChoose',
      type: StepType.START,
      payload: (): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_askStart';
        this.state.game = undefined;
        this.state.options = {
          players: [],
        };
        const question = 'Démarrer ou quitter ? (s, q)';
        const validation = (answer: string): boolean => answer === 's' || answer === 'q';
        askUser(actionId, question, validation, resolve, reject);
      }),
      onResolve: (result: IActionResult) => {
        // console.log('stepChoose onResolve', result);
        if (result.res === 's') {
          return stepNbPlayer;
        } else if (result.res === 'q') {
          return stepClose;
        } else {
          console.log('Invalid choice, choose again');
          return stepChoose;
        }
      },
      onReject: (err: Error) => {
        console.log('stepChoose onError: ', err.message);
        return stepChoose;
      },
    };

    const stepClose: IStep = {
      id: 'stepClose',
      type: StepType.END,
      payload: (): Promise<IActionResult> => new Promise ((resolve, reject) => {
        console.log('Closing');
        rl.close();
        process.stdin.destroy();
        // resolve({id: 'action_closeAll', res: 'ok' });
      }),
    };

    const stepNbPlayer: IStep = {
      id: 'stepNbPlayer',
      type: StepType.NORMAL,
      payload: (): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_askNbPlayer';
        const question = '# Nombre de joueur ? (3, 4, 5)';
        const validation = (answer: string): boolean => answer === '3' || answer === '4' || answer === '5';
        askUser(actionId, question, validation, resolve, reject);
      }),
      onResolve: (result: IActionResult) => {
        console.log('stepNbPlayer onResolve', result);
        if (result.res === '3' || result.res === '4' || result.res === '5') {
          this.state.playerNumberTemp = result.res;
          return stepPlayerNames;
        } else {
          console.log('Invalid choice, choose again');
          return stepNbPlayer;
        }
      },
      onReject: (err: Error) => {
        console.log('stepNbPlayer onError: ', err.message);
        return stepNbPlayer;
      },
    };

    const stepPlayerNames: IStep = {
      id: 'stepPlayerNames',
      type: StepType.NORMAL,
      payload: (iteration): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_askPlayerName';
        const question = '# Nom du Xème joueur ?';
        const validation = (answer: string): boolean => answer.length > 0;
        askUser(actionId, question, validation, resolve, reject);
      }),
      onResolve: (result: IActionResult) => {
        console.log('stepPlayerNames onResolve', result);
        if (result.res.length > 0) {
          this.state.options.players.push(result.res);
          this.state.playerNumberTemp--;
          if (this.state.playerNumberTemp > 0) {
            return stepPlayerNames;
          } else {
            return stepCreateGame;
          }
        } else {
          console.log('Invalid choice, choose again');
          return stepPlayerNames;
        }
      },
      onReject: (err: Error) => {
        console.log('stepPlayerNames onError: ', err.message);
        return stepNbPlayer;
      },
    };

    const stepCreateGame: IStep = {
      id: 'stepCreateGame',
      type: StepType.NORMAL,
      payload: (iteration): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_createGame';
        resolve({ id: actionId, res: this.createNewGame(this.state.options) });
      }),
      onResolve: (result: IActionResult) => {
        console.log('stepCreateGame onResolve', result);
        this.state.game = result.res;
        return stepStartGame;
      },
      onReject: (err: Error) => {
        console.log('stepCreateGame onError: ', err.message);
        return stepChoose;
      },
    };

    const stepStartGame: IStep = {
      id: 'stepStartGame',
      type: StepType.NORMAL,
      payload: (iteration): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_startGame';
        try {
          this.state.game.start();
          resolve({ id: actionId, res: 'game started' });
        } catch (e) {
          reject(e);
        }
      }),
      onResolve: (result: IActionResult) => {
        console.log('stepStartGame onResolve', result);
        return stepPlayNext;
      },
      onReject: (err: Error) => {
        console.log('stepStartGame onError: ', err.message);
        return stepChoose;
      },
    };

    const stepPlayNext: IStep = {
      id: 'stepPlayNext',
      type: StepType.NORMAL,
      payload: (iteration): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_playNext';
        const boardstate = this.state.game.getBoardState();
        const player = boardstate.getActivePlayer();
        const playerTokens = boardstate.getCurrentPlayerTokenPile(player);
        const playerCards = boardstate.getCurrentPlayerCardPiles(player).map((c) => c.getValue());
        const card = boardstate.getCurrentCard().getValue();
        const cardTokens = boardstate.getCurrentTokenBagSize();
        console.log('########################################################');
        console.log('# Joueur actif: ' + player + ', (' + playerTokens + ' jetons)');
        console.log('# Cartes du joueur: ', playerCards);
        console.log('# Carte à prendre: ' + card + '(' + cardTokens + ' jetons)');
        console.log('########################################################');
        const question = '# Choisissez une action ? p pour PAY, t pour TAKE';
        const validation = (answer: string): boolean => answer === 'p' || answer === 't';
        askUser(actionId, question, validation, resolve, reject);
      }),
      onResolve: (result: IActionResult) => {
        console.log('stepPlayNext onResolve', result);
        if (result.res === 'p') {
          this.state.game.playNextTurn(GameAction.Pay);
          return stepPlayNext;
        } else {
          try {
            this.state.game.playNextTurn(GameAction.Take);
            return stepPlayNext;
          } catch (e) {
            const err: Error = e;
            if (err.message === 'END_OF_GAME') {
              return stepShowScore;
            } else {
              return stepChoose;
            }
          }
        }
      },
      onReject: (err: Error) => {
        console.log('stepPlayNext onError: ', err.message);
        return stepPlayNext;
      },
    };

    const stepShowScore: IStep = {
      id: 'stepShowScore',
      type: StepType.NORMAL,
      payload: (iteration): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_showScore';
        const scores = this.state.game.getScores();
        console.log('########################################################');
        console.log('# Scores: ', scores);
        console.log('########################################################');
        resolve({ id: actionId, res: scores });
      }),
      onResolve: (result: IActionResult) => {
        console.log('stepShowScore onResolve', result);
        return stepChoose;
      },
      onReject: (err: Error) => {
        console.log('stepShowScore onError: ', err.message);
        return stepChoose;
      },
    };

    return [
      stepChoose,
      stepClose,
      stepNbPlayer,
      stepPlayerNames,
      stepCreateGame,
      stepStartGame,
      stepPlayNext,
      stepShowScore,
    ];

    // const showInterface = () => new Promise((resolve, reject) => {
    //   console.log('--------------------------------');
    //   console.log('------ Menu principal   --------');
    //   console.log('--------------------------------');
    //   resolve();
    // });

    // const closeAll = (): Promise<IActionResult> => new Promise((resolve, reject) => {
    //   console.log('Closing all');
    //   rl.close();
    //   process.stdin.destroy();
    //   return {id: 'action_closeAll', res: 'ok' };
    // });

    // const askStart = (): Promise<IActionResult> => new Promise((resolve, reject) => {
    //   const actionId = 'action_askStart';
    //   const question = 'Démarrer ou quitter ? (s, q)';
    //   const validation = (answer: string): boolean => answer === 's' || answer === 'q';
    //   askUser(actionId, question, validation, resolve, reject);
    // });
    // const askNbPlayer = (): Promise<IActionResult> => new Promise((resolve, reject) => {
    //   const actionId = 'action_askNbPlayer';
    //   const question = '# Nombre de joueur ? (3, 4, 5)';
    //   const validation = (answer: string): boolean => answer === '3' || answer === '4' || answer === '5';
    //   askUser(actionId, question, validation, resolve, reject);
    // });
    // const askGameAction = (): Promise<IActionResult> => new Promise((resolve, reject) => {
    //   const actionId = 'action_askGameAction';
    //   const question = '# Action de jeu ? (p, t)';
    //   const validation = (answer: string): boolean => answer === 'p' || answer === 't';
    //   askUser(actionId, question, validation, resolve, reject);
    // });

    // const step1: IStep = {
    //   id: 'step_init',
    //   type: StepType.START,
    //   payload: askStart,
    //   onResolve: (result: IActionResult) => {
    //     console.log('step_init onResolve');
    //     return step2;
    //   },
    //   onReject: (err: Error) => {
    //     console.log('step_init onError: ', err.message);
    //     return step1;
    //   },
    // };

    // const step2: IStep = {
    //   id: 'step_stuff',
    //   type: StepType.NORMAL,
    //   payload: askNbPlayer,
    //   onResolve: (result: IActionResult) => {
    //     console.log('step_stuff onResolve');
    //     return step3;
    //   },
    //   onReject: (err: Error) => {
    //     console.log('step_stuff onError: ', err.message);
    //     return step1;
    //   },
    // };

    // const step3: IStep = {
    //   id: 'step_closeALl',
    //   type: StepType.END,
    //   payload: closeAll,
    // };
  }
}

interface IState {
  playerNumberTemp: number;
  options: IGameOptions;
  game?: Game;
}
