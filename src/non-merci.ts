/* tslint:disable:object-literal-sort-keys */
// import commander = require('commander');
import EventEmitter = require('events');
import readline = require('readline');
import Game, { IGameOptions } from './game';

export default class NomMerci {
  /************************************************************************************************
   * Constructor
   ************************************************************************************************/
  constructor() {
    console.log('#####################################################################');
    console.log('###############              NON MERCI               ################');
    console.log('#####################################################################');
    // this.program = new commander();
  }

  /************************************************************************************************
   * Public methods
   ************************************************************************************************/
  public createNewGame(options?: IGameOptions): Game {
    return new Game(options);
  }

  public main() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askUser = (id: string, question: string, validation: (any), resolve: any, reject: any) => {
      rl.question(question, (answer) => validation(answer)
        ? resolve({ id, res: answer })
        : reject(new Error('Réponse invalide: ' + answer)));
    };

    const showInterface = () => new Promise((resolve, reject) => {
      console.log('--------------------------------');
      console.log('------ Menu principal   --------');
      console.log('--------------------------------');
      resolve();
    });

    const closeAll = (): Promise<IActionResult> => new Promise((resolve, reject) => {
      console.log('Closing all');
      rl.close();
      process.stdin.destroy();
      return {id: 'action_closeAll', res: 'ok' };
    });

    const askStart = (): Promise<IActionResult> => new Promise((resolve, reject) => {
      const actionId = 'action_askStart';
      const question = 'Démarrer ou quitter ? (s, q)';
      const validation = (answer: string): boolean => answer === 's' || answer === 'q';
      askUser(actionId, question, validation, resolve, reject);
      // rl.question('Démarrer ou quitter ? (s, q)', (answer) => {
      //   answer === 's' || answer === 'q'
      //     ? resolve({ id: actionId, res: answer })
      //     : reject(new Error('invalid input'));
      // });
    });
    const askNbPlayer = (): Promise<IActionResult> => new Promise((resolve, reject) => {
      const actionId = 'action_askNbPlayer';
      const question = '# Nombre de joueur ? (3, 4, 5)';
      const validation = (answer: string): boolean => answer === '3' || answer === '4' || answer === '5';
      askUser(actionId, question, validation, resolve, reject);
      // rl.question('# Nombre de joueur ? (3, 4, 5)', (answer) => {
      //   resolve(answer);
      // });
    });
    const askGameAction = (): Promise<IActionResult> => new Promise((resolve, reject) => {
      const actionId = 'action_askGameAction';
      const question = '# Action de jeu ? (p, t)';
      const validation = (answer: string): boolean => answer === 'p' || answer === 't';
      askUser(actionId, question, validation, resolve, reject);
      // rl.question('# Action ? (p, t)', (answer) => {
      //   resolve(answer);
      // });
    });

    const step1: IStep = {
      id: 'step_init',
      payload: askStart,
      onResolve: (result: IActionResult) => {
        console.log('step_init onResolve');
        return step2;
      },
      onReject: (err: Error) => {
        console.log('step_init onError: ', err.message);
        return step1;
      },
    };

    const step2: IStep = {
      id: 'step_stuff',
      payload: askNbPlayer,
      onResolve: (result: IActionResult) => {
        console.log('step_stuff onResolve');
        return step3;
      },
      onReject: (err: Error) => {
        console.log('step_stuff onError: ', err.message);
        return step1;
      },
    };

    const step3: IStep = {
      id: 'step_closeALl',
      payload: closeAll,
    };

    /////////////// START
    this.stepResolver(step1);
  }

  /************************************************************************************************
   * Privates methods
   ************************************************************************************************/
  /**
   * Workflow Step resolver
   */
  private stepResolver = (step: IStep) => {
    console.log('stepResolver');
    step.payload().then((res) => {
      console.log('stepResolver THEN');
      step.onResolve ? this.stepResolver(step.onResolve(res)) : console.log('stepResolver NO MORE ACTION');
    }).catch((err) => {
      console.log('stepResolver CATCH');
      step.onReject ? this.stepResolver(step.onReject(err)) : console.log('stepResolver NO MORE ACTION');
    });
  }

  /**
   * Workflow Steps Defintions
   */

  /**
   * Workflow Steps Payload Definitions
   */
}

interface IActionResult {
  id: string;
  res: any;
}

interface IStep {
  id: string;
  payload: () => Promise<IActionResult>;
  onResolve?: (res: IActionResult) => IStep;
  onReject?: (err: Error) => IStep;
}
