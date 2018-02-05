"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const game_1 = require("./game");
const workflow_1 = require("./../workflow/workflow");
class NomMerci {
    /************************************************************************************************
     * Constructor
     ************************************************************************************************/
    constructor() {
        this.state = {
            playerNumberTemp: 0,
            options: {
                players: [],
            },
        };
        console.log('#####################################################################');
        console.log('###############              NON MERCI               ################');
        console.log('#####################################################################');
        // this.program = new commander();
    }
    /************************************************************************************************
     * Public methods
     ************************************************************************************************/
    createNewGame(options) {
        console.log(options);
        return new game_1.default(options);
    }
    main() {
        /////////////// INIT stepCollection
        const nmSteps = this.initSteps();
        /////////////// INIT Workflow
        const nonMerciWorkflow = new workflow_1.default(nmSteps);
        /////////////// START
        nonMerciWorkflow.startWorkflow();
    }
    /************************************************************************************************
     * Privates methods
     ************************************************************************************************/
    initSteps() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const askUser = (id, question, validation, resolve, reject) => {
            rl.question(question, (answer) => validation(answer)
                ? resolve({ id, res: answer })
                : reject(new Error('Réponse invalide: ' + answer)));
        };
        const stepChoose = {
            id: 'stepChoose',
            type: workflow_1.StepType.START,
            payload: () => new Promise((resolve, reject) => {
                const actionId = 'action_askStart';
                this.state.game = undefined;
                this.state.options = {
                    players: [],
                };
                const question = 'Démarrer ou quitter ? (s, q)';
                const validation = (answer) => answer === 's' || answer === 'q';
                askUser(actionId, question, validation, resolve, reject);
            }),
            onResolve: (result) => {
                console.log('stepChoose onResolve', result);
                if (result.res === 's') {
                    return stepNbPlayer;
                }
                else if (result.res === 'q') {
                    return stepClose;
                }
                else {
                    console.log('Invalid choice, choose again');
                    return stepChoose;
                }
            },
            onReject: (err) => {
                console.log('stepChoose onError: ', err.message);
                return stepChoose;
            },
        };
        const stepClose = {
            id: 'stepClose',
            type: workflow_1.StepType.END,
            payload: () => new Promise((resolve, reject) => {
                console.log('Closing');
                rl.close();
                process.stdin.destroy();
                // resolve({id: 'action_closeAll', res: 'ok' });
            }),
        };
        const stepNbPlayer = {
            id: 'stepNbPlayer',
            type: workflow_1.StepType.NORMAL,
            payload: () => new Promise((resolve, reject) => {
                const actionId = 'action_askNbPlayer';
                const question = '# Nombre de joueur ? (3, 4, 5)';
                const validation = (answer) => answer === '3' || answer === '4' || answer === '5';
                askUser(actionId, question, validation, resolve, reject);
            }),
            onResolve: (result) => {
                console.log('stepNbPlayer onResolve', result);
                if (result.res === '3' || result.res === '4' || result.res === '5') {
                    this.state.playerNumberTemp = result.res;
                    return stepPlayerNames;
                }
                else {
                    console.log('Invalid choice, choose again');
                    return stepNbPlayer;
                }
            },
            onReject: (err) => {
                console.log('stepNbPlayer onError: ', err.message);
                return stepNbPlayer;
            },
        };
        const stepPlayerNames = {
            id: 'stepPlayerNames',
            type: workflow_1.StepType.NORMAL,
            payload: (iteration) => new Promise((resolve, reject) => {
                const actionId = 'action_askPlayerName';
                const question = '# Nom du Xème joueur ?';
                const validation = (answer) => answer.length > 0;
                askUser(actionId, question, validation, resolve, reject);
            }),
            onResolve: (result) => {
                console.log('stepPlayerNames onResolve', result);
                if (result.res.length > 0) {
                    this.state.options.players.push(result.res);
                    this.state.playerNumberTemp--;
                    if (this.state.playerNumberTemp > 0) {
                        return stepPlayerNames;
                    }
                    else {
                        return stepCreateGame;
                    }
                }
                else {
                    console.log('Invalid choice, choose again');
                    return stepPlayerNames;
                }
            },
            onReject: (err) => {
                console.log('stepPlayerNames onError: ', err.message);
                return stepNbPlayer;
            },
        };
        const stepCreateGame = {
            id: 'stepCreateGame',
            type: workflow_1.StepType.NORMAL,
            payload: (iteration) => new Promise((resolve, reject) => {
                const actionId = 'action_createGame';
                resolve({ id: actionId, res: this.createNewGame(this.state.options) });
            }),
            onResolve: (result) => {
                console.log('stepCreateGame onResolve', result);
                this.state.game = result.res;
                return stepStartGame;
            },
            onReject: (err) => {
                console.log('stepCreateGame onError: ', err.message);
                return stepChoose;
            },
        };
        const stepStartGame = {
            id: 'stepStartGame',
            type: workflow_1.StepType.NORMAL,
            payload: (iteration) => new Promise((resolve, reject) => {
                const actionId = 'action_startGame';
                try {
                    this.state.game.start();
                    resolve({ id: actionId, res: 'game started' });
                }
                catch (e) {
                    reject(e);
                }
            }),
            onResolve: (result) => {
                console.log('stepStartGame onResolve', result);
                return stepPlayNext;
            },
            onReject: (err) => {
                console.log('stepStartGame onError: ', err.message);
                return stepChoose;
            },
        };
        const stepPlayNext = {
            id: 'stepPlayNext',
            type: workflow_1.StepType.NORMAL,
            payload: (iteration) => new Promise((resolve, reject) => {
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
                const validation = (answer) => answer === 'p' || answer === 't';
                askUser(actionId, question, validation, resolve, reject);
            }),
            onResolve: (result) => {
                console.log('stepPlayNext onResolve', result);
                if (result.res === 'p') {
                    this.state.game.playNextTurn(game_1.GameAction.Pay);
                    return stepPlayNext;
                }
                else {
                    try {
                        this.state.game.playNextTurn(game_1.GameAction.Take);
                        return stepPlayNext;
                    }
                    catch (e) {
                        const err = e;
                        if (err.message === 'END_OF_GAME') {
                            return stepShowScore;
                        }
                        else {
                            return stepChoose;
                        }
                    }
                }
            },
            onReject: (err) => {
                console.log('stepPlayNext onError: ', err.message);
                return stepPlayNext;
            },
        };
        const stepShowScore = {
            id: 'stepShowScore',
            type: workflow_1.StepType.NORMAL,
            payload: (iteration) => new Promise((resolve, reject) => {
                const actionId = 'action_showScore';
                const scores = this.state.game.getScores();
                console.log('########################################################');
                console.log('# Scores: ', scores);
                console.log('########################################################');
                resolve({ id: actionId, res: scores });
            }),
            onResolve: (result) => {
                console.log('stepShowScore onResolve', result);
                return stepChoose;
            },
            onReject: (err) => {
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
exports.default = NomMerci;
//# sourceMappingURL=non-merci.js.map