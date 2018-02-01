"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:object-literal-sort-keys */
// import commander = require('commander');
const EventEmitter = require("events");
const readline = require("readline");
const game_1 = require("./game");
class NomMerci {
    constructor() {
        console.log('######################################################################');
        console.log('################         NON MERCI         ###########################');
        console.log('######################################################################');
        // this.program = new commander();
    }
    createNewGame(options) {
        return new game_1.default(options);
    }
    main() {
        const myEmitter = new EventEmitter();
        // let nbPlayers: number;
        // let playerName: string;
        // let game: Game;
        // let players: string[];
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const askUser = (id, question, validation, resolve, reject) => {
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
        const closeAll = () => new Promise((resolve, reject) => {
            console.log('Closing all');
            rl.close();
            process.stdin.destroy();
            return { id: 'action_closeAll', res: 'ok' };
        });
        const askStart = () => new Promise((resolve, reject) => {
            const actionId = 'action_askStart';
            const question = 'Démarrer ou quitter ? (s, q)';
            const validation = (answer) => answer === 's' || answer === 'q';
            askUser(actionId, question, validation, resolve, reject);
            // rl.question('Démarrer ou quitter ? (s, q)', (answer) => {
            //   answer === 's' || answer === 'q'
            //     ? resolve({ id: actionId, res: answer })
            //     : reject(new Error('invalid input'));
            // });
        });
        const askNbPlayer = () => new Promise((resolve, reject) => {
            const actionId = 'action_askNbPlayer';
            const question = '# Nombre de joueur ? (3, 4, 5)';
            const validation = (answer) => answer === '3' || answer === '4' || answer === '5';
            askUser(actionId, question, validation, resolve, reject);
            // rl.question('# Nombre de joueur ? (3, 4, 5)', (answer) => {
            //   resolve(answer);
            // });
        });
        const askGameAction = () => new Promise((resolve, reject) => {
            const actionId = 'action_askGameAction';
            const question = '# Action de jeu ? (p, t)';
            const validation = (answer) => answer === 'p' || answer === 't';
            askUser(actionId, question, validation, resolve, reject);
            // rl.question('# Action ? (p, t)', (answer) => {
            //   resolve(answer);
            // });
        });
        const step1 = {
            id: 'step_init',
            action: askStart,
            onResolve: (result) => {
                console.log('step_init onResolve');
                return step2;
            },
            onReject: (err) => {
                console.log('step_init onError: ', err.message);
                return step1;
            },
        };
        const step2 = {
            id: 'step_stuff',
            action: askNbPlayer,
            onResolve: (result) => {
                console.log('step_stuff onResolve');
                return step3;
            },
            onReject: (err) => {
                console.log('step_stuff onError: ', err.message);
                return step1;
            },
        };
        const step3 = {
            id: 'step_closeALl',
            action: closeAll,
        };
        const stepResolver = (step) => {
            console.log('stepResolver');
            step.action().then((res) => {
                console.log('stepResolver THEN');
                step.onResolve ? stepResolver(step.onResolve(res)) : console.log('stepResolver NO MORE ACTION');
            }).catch((err) => {
                console.log('stepResolver CATCH');
                step.onReject ? stepResolver(step.onReject(err)) : console.log('stepResolver NO MORE ACTION');
            });
        };
        /////////////// START
        stepResolver(step1);
        // let actionChain: Array<() => Promise<any>> = [showInterface, askStart, askNbPlayer, closeAll];
        // Main menu
        //    1: Start ?
        //      > yes =>
        //        1.yes.a: nbPlayer ?
        //          > 2, 3, 4
        //            1.yes.a.2
        //        1.yes.b: (xN) namePlayer
        //      > no =>
        //        1.no   : quit
        /**
         * action : Promise<result>
         *
         * result : {
         *    actionName: string
         *    actionRes: any
         * }
         *
         * Workflow :
         *  step: {
         *    stepName     : string
         *    stepAction   : () => action
         *    stepOnResolve: () => step
         *    stepOnReject : () => step
         * }
         *
         * StepResolver = (step):  => stepAction().then(stepOnResolve).catch(stepOnReject)
         */
        // actionChain.reduce((prev, curr) => prev.then(curr).catch((err) => closeAll(err)), Promise.resolve());
        // actionChain.shift().then();
        // showInterface()
        //   .then(askStart)
        //   .then(askNbPlayer)
        //   .then(askAction)
        //   .then(closeAll)
        //   .catch(closeAll);
        //   rl.close();
        //   process.stdin.destroy();
    }
}
exports.default = NomMerci;
//# sourceMappingURL=non-merci.js.map