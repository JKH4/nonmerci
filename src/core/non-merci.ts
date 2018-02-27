/* tslint:disable:object-literal-sort-keys */
// import commander = require('commander');
import EventEmitter = require('events');
import readline = require('readline');

import IBoardState, { ActionType } from './board-helper';
import Card from './card';
import Game, { IGameOptions } from './game';

import Drawer, { IDrawOptions } from '../cli/drawer';
import Workflow, { IActionResult, IStep, StepType } from './../workflow/workflow';

import Bot, { BrainOptions } from './../bot/bot';

const MAX_WIDTH = 120;

export default class NomMerci {
  private state: IState = {
    playerNumberTemp: 0,
    options: {
      players: [],
    },
    bots: {},
  };
  private drawer: Drawer;

  /************************************************************************************************
   * Constructor
   ************************************************************************************************/
  constructor() {
    //
  }

  /************************************************************************************************
   * Public methods
   ************************************************************************************************/
  public createNewGame(options?: IGameOptions): Game {
    // console.log(options);
    return new Game(options);
  }

  public main() {
    const nmSteps = this.initSteps(); //////////////// INIT stepCollection
    const nonMerciWorkflow = new Workflow(nmSteps); // INIT Workflow
    this.drawer = new Drawer(); ////////////////////// INIT Workflow

    nonMerciWorkflow.startWorkflow(); //////////////// START
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
      let result = '';
      result += this.drawer.drawBorder({ maxWidth: MAX_WIDTH, pos: 'top' });
      result += this.drawer.drawQuestion( { maxWidth: MAX_WIDTH }, question);
      result += this.drawer.drawBorder({ maxWidth: MAX_WIDTH, pos: 'bot' });
      console.log(result);
      rl.question('?', (answer) => validation(answer)
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
        const question = 'Démarrer (d) ou quitter (q) ? (par défaut d)';
        const validation = (answer: string): boolean => answer === 'd' || answer === 'q' || answer === '';
        askUser(actionId, question, validation, resolve, reject);
      }),
      onResolve: (result: IActionResult) => {
        switch (result.res) {
          case 'd':
            return stepNbPlayer;
          case '':
            return stepNbPlayer;
          case 'q':
            return stepClose;
          default:
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
        const question = 'Nombre de joueur ? (3 à 5, par défaut 4)';
        const validation = (answer: string): boolean =>
          answer === '3' || answer === '4' || answer === '5' || answer === '';
        askUser(actionId, question, validation, resolve, reject);
      }),
      onResolve: (result: IActionResult) => {
        // console.log('stepNbPlayer onResolve', result);
        if (result.res === '3' || result.res === '4' || result.res === '5') {
          this.state.playerNumberTemp = result.res;
          return stepPlayerNames;
        } else if (result.res === '') {
          this.state.playerNumberTemp = 4;
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
      payload: (): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_askPlayerName';
        const xieme = 1 + this.state.options.players.length;
        const question = 'Modifier le nom de Joueur_' + xieme + ' ? (Joueur_' + xieme + ' par défault)';
        const validation = (answer: string): boolean => true;
        askUser(actionId, question, validation, resolve, reject);
      }),
      onResolve: (result: IActionResult) => {
        // console.log('stepPlayerNames onResolve', result);
        if (result.res.length > 0) {
          if ((result.res as string).startsWith('bot')) {
            result.res = this.initBot(result.res);
          }
          this.state.options.players.push(result.res);
          this.state.playerNumberTemp--;
          if (this.state.playerNumberTemp > 0) {
            return stepPlayerNames;
          } else {
            return stepCreateGame;
          }
        } else {
          this.state.options.players.push('Joueur_' + (1 + this.state.options.players.length));
          this.state.playerNumberTemp--;
          if (this.state.playerNumberTemp > 0) {
            return stepPlayerNames;
          } else {
            return stepCreateGame;
          }
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
        // console.log('stepCreateGame onResolve', result);
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
        // console.log('stepStartGame onResolve', result);
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
        const board = this.state.game.getBoard();
        const boardstate = board.getState();
        const player = boardstate.activePlayer;
        try {
          console.log(this.drawer.drawBoard({ maxWidth: MAX_WIDTH}, boardstate));
        } catch (e) {
          console.error(e);
          const playerTokens = boardstate.players
            .find((p) => p.name === boardstate.activePlayer).hiddenTokens;
          const playerCards = boardstate.players
            .find((p) => p.name === boardstate.activePlayer).cards
            .map((value) => value <= 9 ? '│ ' + value + '│' : '│'  + value + '│');
          const card = boardstate.visibleCard;
          const cardTokens = boardstate.visibleTokens; // .getCurrentTokenBagSize();
          console.log('############## UX du pauvre ##########################################');
          console.log('# Joueur actif: ' + player + ', (' + playerTokens + ' jetons)');
          console.log('# Cartes du joueur: ', playerCards);
          console.log('# Carte à prendre: ' + card + '(' + cardTokens + ' jetons)');
          console.log('######################################################################');
        }
        if (player.startsWith('bot')) {
          const botAction = this.state.bots[player].proposeAction(board);
          const answer = botAction.type === ActionType.PAY ? 'p' : 't';
          // console.log('# Action choisi par ' + player + ' (bot) : '
          //  + botAction + '(workflow answer: ' + answer + ')');
          resolve({ id: actionId, res: answer });
        } else {
          const question = 'Choisissez une action ? PAY (p) ou TAKE (t), (t) par défaut';
          const validation = (answer: string): boolean => answer === 'p' || answer === 't';
          askUser(actionId, question, validation, resolve, reject);
        }
      }),
      onResolve: (result: IActionResult) => {
        // console.log('stepPlayNext onResolve', result);
        if (result.res === 'p') {
          this.state.game.playNextTurn(ActionType.PAY);
          return stepPlayNext;
        } else {
          try {
            this.state.game.playNextTurn(ActionType.TAKE);
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
        console.log('stepPlayNext onError: ', err.stack);
        return stepPlayNext;
      },
    };

    const stepShowScore: IStep = {
      id: 'stepShowScore',
      type: StepType.NORMAL,
      payload: (iteration): Promise<IActionResult> => new Promise ((resolve, reject) => {
        const actionId = 'action_showScore';
        const scores = this.state.game.getScores();
        try {
          console.log(this.drawer.drawScores({ maxWidth: MAX_WIDTH }, scores));
        } catch (e) {
          console.error(e);
          console.log('############## UX du pauvre ##########################################');
          console.log('# Scores: ', scores);
          console.log('######################################################################');
        }
        resolve({ id: actionId, res: scores });
      }),
      onResolve: (result: IActionResult) => {
        // console.log('stepShowScore onResolve', result);
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
  }

  private initBot = (name: string): string => {
    const id = Math.floor(Math.random() * 1000);
    let nameWithId = name + '_' + id;
    if (!name.startsWith('bot')) {
      throw new Error('INVALID_BOT_NAME');
    } else if (name.indexOf('random') > -1) {
      this.state.bots[nameWithId] = new Bot(BrainOptions.Random);
      return nameWithId;
    } else if (name.indexOf('mcts1') > -1) {
      this.state.bots[nameWithId] = new Bot(BrainOptions.Mcts1);
      return nameWithId;
    } else if (name.indexOf('take') > -1) {
      this.state.bots[nameWithId] = new Bot(BrainOptions.Take);
      return nameWithId;
    } else {
      nameWithId = name + '_random_' + id;
      this.state.bots[nameWithId] = new Bot(BrainOptions.Random);
      return nameWithId;
    }
  }
}

interface IState {
  playerNumberTemp: number;
  options: IGameOptions;
  game?: Game;
  bots?: {
    [name: string]: Bot;
  };
}
