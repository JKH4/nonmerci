"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const readline = require("readline");
const board_helper_1 = require("./board-helper");
const game_1 = require("./game");
const drawer_1 = require("../cli/drawer");
const workflow_1 = require("./../workflow/workflow");
const bot_1 = require("./../bot/bot");
const MAX_WIDTH = 120;
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
            bots: {},
        };
        this.initBot = (name) => {
            const id = Math.floor(Math.random() * 1000);
            let nameWithId = name + '_' + id;
            if (!name.startsWith('bot')) {
                throw new Error('INVALID_BOT_NAME');
            }
            else if (name.indexOf('random') > -1) {
                this.state.bots[nameWithId] = new bot_1.default(bot_1.BrainOptions.Random);
                return nameWithId;
            }
            else if (name.indexOf('mcts1') > -1) {
                this.state.bots[nameWithId] = new bot_1.default(bot_1.BrainOptions.Mcts1);
                return nameWithId;
            }
            else if (name.indexOf('take') > -1) {
                this.state.bots[nameWithId] = new bot_1.default(bot_1.BrainOptions.Take);
                return nameWithId;
            }
            else {
                nameWithId = name + '_random_' + id;
                this.state.bots[nameWithId] = new bot_1.default(bot_1.BrainOptions.Random);
                return nameWithId;
            }
        };
        //
    }
    /************************************************************************************************
     * Public methods
     ************************************************************************************************/
    createNewGame(options) {
        // console.log(options);
        return new game_1.default(options);
    }
    main() {
        const nmSteps = this.initSteps(); //////////////// INIT stepCollection
        const nonMerciWorkflow = new workflow_1.default(nmSteps); // INIT Workflow
        this.drawer = new drawer_1.default(); ////////////////////// INIT Workflow
        nonMerciWorkflow.startWorkflow(); //////////////// START
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
            let result = '';
            result += this.drawer.drawBorder({ maxWidth: MAX_WIDTH, pos: 'top' });
            result += this.drawer.drawQuestion({ maxWidth: MAX_WIDTH }, question);
            result += this.drawer.drawBorder({ maxWidth: MAX_WIDTH, pos: 'bot' });
            console.log(result);
            rl.question('?', (answer) => validation(answer)
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
                const question = 'Démarrer (d) ou quitter (q) ? (par défaut d)';
                const validation = (answer) => answer === 'd' || answer === 'q' || answer === '';
                askUser(actionId, question, validation, resolve, reject);
            }),
            onResolve: (result) => {
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
                const question = 'Nombre de joueur ? (3 à 5, par défaut 4)';
                const validation = (answer) => answer === '3' || answer === '4' || answer === '5' || answer === '';
                askUser(actionId, question, validation, resolve, reject);
            }),
            onResolve: (result) => {
                // console.log('stepNbPlayer onResolve', result);
                if (result.res === '3' || result.res === '4' || result.res === '5') {
                    this.state.playerNumberTemp = result.res;
                    return stepPlayerNames;
                }
                else if (result.res === '') {
                    this.state.playerNumberTemp = 4;
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
            payload: () => new Promise((resolve, reject) => {
                const actionId = 'action_askPlayerName';
                const xieme = 1 + this.state.options.players.length;
                const question = 'Modifier le nom de Joueur_' + xieme + ' ? (Joueur_' + xieme + ' par défault)';
                const validation = (answer) => true;
                askUser(actionId, question, validation, resolve, reject);
            }),
            onResolve: (result) => {
                // console.log('stepPlayerNames onResolve', result);
                if (result.res.length > 0) {
                    if (result.res.startsWith('bot')) {
                        result.res = this.initBot(result.res);
                    }
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
                    this.state.options.players.push('Joueur_' + (1 + this.state.options.players.length));
                    this.state.playerNumberTemp--;
                    if (this.state.playerNumberTemp > 0) {
                        return stepPlayerNames;
                    }
                    else {
                        return stepCreateGame;
                    }
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
                // console.log('stepCreateGame onResolve', result);
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
                // console.log('stepStartGame onResolve', result);
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
                const board = this.state.game.getBoard();
                const boardstate = board.getState();
                const player = boardstate.activePlayer;
                try {
                    console.log(this.drawer.drawBoard({ maxWidth: MAX_WIDTH }, boardstate));
                }
                catch (e) {
                    console.error(e);
                    const playerTokens = boardstate.players
                        .find((p) => p.name === boardstate.activePlayer).hiddenTokens;
                    const playerCards = boardstate.players
                        .find((p) => p.name === boardstate.activePlayer).cards
                        .map((value) => value <= 9 ? '│ ' + value + '│' : '│' + value + '│');
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
                    const answer = botAction.type === board_helper_1.ActionType.PAY ? 'p' : 't';
                    // console.log('# Action choisi par ' + player + ' (bot) : '
                    //  + botAction + '(workflow answer: ' + answer + ')');
                    resolve({ id: actionId, res: answer });
                }
                else {
                    const question = 'Choisissez une action ? PAY (p) ou TAKE (t), (t) par défaut';
                    const validation = (answer) => answer === 'p' || answer === 't';
                    askUser(actionId, question, validation, resolve, reject);
                }
            }),
            onResolve: (result) => {
                // console.log('stepPlayNext onResolve', result);
                if (result.res === 'p') {
                    this.state.game.playNextTurn(board_helper_1.ActionType.PAY);
                    return stepPlayNext;
                }
                else {
                    try {
                        this.state.game.playNextTurn(board_helper_1.ActionType.TAKE);
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
                console.log('stepPlayNext onError: ', err.stack);
                return stepPlayNext;
            },
        };
        const stepShowScore = {
            id: 'stepShowScore',
            type: workflow_1.StepType.NORMAL,
            payload: (iteration) => new Promise((resolve, reject) => {
                const actionId = 'action_showScore';
                const scores = this.state.game.getScores();
                try {
                    console.log(this.drawer.drawScores({ maxWidth: MAX_WIDTH }, scores));
                }
                catch (e) {
                    console.error(e);
                    console.log('############## UX du pauvre ##########################################');
                    console.log('# Scores: ', scores);
                    console.log('######################################################################');
                }
                resolve({ id: actionId, res: scores });
            }),
            onResolve: (result) => {
                // console.log('stepShowScore onResolve', result);
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
    }
}
exports.default = NomMerci;
//# sourceMappingURL=non-merci.js.map