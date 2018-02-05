/* tslint:disable:object-literal-sort-keys */
// import commander = require('commander');
import EventEmitter = require('events');
import readline = require('readline');

import { ICurrentBoardState } from './board-state';
import Card from './card';
import Game, { GameAction, IGameOptions } from './game';

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
      let result = '';
      result += this.drawBorder({ maxWidth: MAX_WIDTH, pos: 'top' });
      result += this.drawQuestion( { maxWidth: MAX_WIDTH }, question);
      result += this.drawBorder({ maxWidth: MAX_WIDTH, pos: 'bot' });
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
        const boardstate = this.state.game.getBoardState().getCurrentBoardState();
        const player = boardstate.activePlayer.name;
        try {
          console.log(this.drawBoard({ maxWidth: MAX_WIDTH}, boardstate));
        } catch (e) {
          console.error(e);
          const playerTokens = boardstate.activePlayer.tokens;
          const playerCards = boardstate.activePlayer.cards.map((c) => c.toString());
          const card = boardstate.deck.visibleCard;
          const cardTokens = boardstate.deck.visibleCardTokens; // .getCurrentTokenBagSize();
          console.log('############## UX du pauvre ##########################################');
          console.log('# Joueur actif: ' + player + ', (' + playerTokens + ' jetons)');
          console.log('# Cartes du joueur: ', playerCards);
          console.log('# Carte à prendre: ' + card + '(' + cardTokens + ' jetons)');
          console.log('######################################################################');
        }
        if (player.startsWith('bot')) {
          const botAction = this.state.bots[player].proposeAction(boardstate);
          const answer = botAction === GameAction.Pay ? 'p' : 't';
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
        try {
          console.log(this.drawScores({ maxWidth: MAX_WIDTH }, scores));
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
    } else if (name.indexOf('take') > -1) {
      this.state.bots[nameWithId] = new Bot(BrainOptions.Take);
      return nameWithId;
    } else {
      nameWithId = name + '_random_' + id;
      this.state.bots[nameWithId] = new Bot(BrainOptions.Random);
      return nameWithId;
    }
  }

  // private drawAll = (boardstate: ICurrentBoardState) => {
  //   let result = '';
  //   result += this.drawBoard({ maxWidth: MAX_WIDTH }, boardstate);
  //   return result;
  //   // this.drawOtherPlayers(boardstate, maxWidth);
  //   // this.drawOtherMe(boardstate, maxWidth);
  //   // console.log('##################################################');
  //   // console.log('# Tour 0018                                      #');
  //   // console.log('#                ┌──┐┐┐┐┐┐┐┐┐┐┐┐┐┐┐┐┐┐┐┐┐             #');
  //   // console.log('#  \ 25 /        │19│││││││││││││││││││││             #');
  //   // console.log('#   \__/         └──┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘┘             #');
  //   // console.log('##################################################');
  //   // console.log('# Les autres joueurs                             #');
  //   // console.log('#            ┌──┐ ┌──┐┌──┐ ┌──┐┌──┐              #');
  //   // console.log('#  Joueur1   │ 3│ │ 7..19│ │19..19│              #');
  //   // console.log('#  ~24       └──┘ └──┘└──┘ └──┘└──┘              #');
  //   // console.log('#            ┌──┐ ┌──┐┌──┐ ┌──┐┌──┐              #');
  //   // console.log('#  Joueur2   │ 3│ │ 7..19│ │19..19│              #');
  //   // console.log('#  ~12       └──┘ └──┘└──┘ └──┘└──┘              #');
  //   // console.log('#            ┌──┐ ┌──┐┌──┐ ┌──┐┌──┐              #');
  //   // console.log('#  Joueur3   │ 3│ │ 7..19│ │19..19│              #');
  //   // console.log('#  ~156      └──┘ └──┘└──┘ └──┘└──┘              #');
  //   // console.log('##################################################');
  //   // console.log('# Votre situation                                #');
  //   // console.log('#           ┌──┐ ┌──┐┌──┐ ┌──┐┌──┐               #');
  //   // console.log('#  \ 25 /   │ 3│ │ 7..19│ │19..19│               #');
  //   // console.log('#   \__/    └──┘ └──┘└──┘ └──┘└──┘               #');
  //   // console.log('##################################################');
  // }

  private drawBoard = ({ maxWidth }: IDrawOptions, boardstate: ICurrentBoardState): string => {
    let result = '';
    result += this.drawBorder({ maxWidth, pos: 'top' });
    result += this.drawTitle({ maxWidth },
      'Tour ' + this.state.game.getCurrentTurn() + ', Joueur Actif: ' + boardstate.activePlayer.name);
    result += this.drawBoardCardAndToken({ maxWidth, pos: 'top' }, boardstate);
    result += this.drawBoardCardAndToken({ maxWidth, pos: 'mid' }, boardstate);
    result += this.drawBoardCardAndToken({ maxWidth, pos: 'bot' }, boardstate);
    result += this.drawBorder({ maxWidth, pos: 'mid' });
    result += this.drawTitle({ maxWidth }, 'Les autres joueurs...');
    boardstate.otherPlayers.forEach((player) => {
      result += this.drawOtherPlayerCards({ maxWidth, pos: 'top' }, player);
      result += this.drawOtherPlayerCards({ maxWidth, pos: 'mid' }, player);
      result += this.drawOtherPlayerCards({ maxWidth, pos: 'bot' }, player);
    });
    result += this.drawBorder({ maxWidth, pos: 'mid' });
    result += this.drawTitle({ maxWidth }, 'Votre situation... (' + boardstate.activePlayer.name + ')');
    result += this.drawActivePlayerSituation({ maxWidth, pos: 'top' }, boardstate.activePlayer);
    result += this.drawActivePlayerSituation({ maxWidth, pos: 'mid' }, boardstate.activePlayer);
    result += this.drawActivePlayerSituation({ maxWidth, pos: 'bot' }, boardstate.activePlayer);
    result += this.drawBorder({ maxWidth, pos: 'bot' });
    return result;
  }

  private drawBorder = ({ pos, maxWidth }: IDrawOptions): string => {
    const first =
      pos === 'top' ? '╔'
      : pos === 'mid' ? '╠'
      : '╚';
    const last =
      pos === 'top' ? '╗'
      : pos === 'mid' ? '╣'
      : '╝';
    const stuff = '═';

    let result = '';
    result += first;
    while (result.length < (maxWidth - last.length)) {
      result += stuff;
    }
    result += last;
    return result + '\r\n';
  }

  private drawTitle = ({ maxWidth }: IDrawOptions, title: string): string => {
    const first = '║ ';
    const last = ' ║';
    const stuff = ' ';

    let result = '';
    result += first;
    result += title.substr(0, maxWidth - first.length - last.length);
    while (result.length < (maxWidth - last.length)) {
      result += stuff;
    }
    result += last;
    return result + '\r\n';
  }

  private drawBoardCardAndToken = ({ maxWidth, pos }: IDrawOptions, boardstate: ICurrentBoardState): string => {
    const first = '║ ';
    const last = ' ║';
    const stuff = ' ';

    const deckSize = boardstate.deck.deckSize;
    const visibleCard = boardstate.deck.visibleCard;
    const tokens = boardstate.deck.visibleCardTokens;

    let result = '';
    result += first;
    switch (pos) {
      case 'top':
        result += '               ┌──┐';
        for (let i = 0; i < deckSize; i++) {
          result += '┐';
        }
        break;
      case 'mid':
        result += '  \\ ' + (tokens <= 9 ? ' ' : '') + tokens + ' /       ' + visibleCard.toString();
        for (let i = 0; i < deckSize; i++) {
          result += '│';
        }
        break;
      case 'bot':
        result += '   \\__/        └──┘';
        for (let i = 0; i < deckSize; i++) {
          result += '┘';
        }
        break;
      default:
        throw new Error('DRAW_INVALID_POS');
    }
    while (result.length < (maxWidth - last.length)) {
      result += stuff;
    }
    result += last;
    return result + '\r\n';
  }

  private drawOtherPlayerCards = ({ maxWidth, pos }: IDrawOptions, player: { name: string, cards: Card[]}): string => {
    const first = '║ ';
    const last = ' ║';
    const stuff = ' ';

    let result = '';
    result += first;
    switch (pos) {
      case 'top':
        result += '               ';
        result += this.drawVisibleCards({ maxWidth, pos }, player.cards);
        break;
      case 'mid':
        result += player.name.substr(0, 14) + ':';
        while (result.length < 17) {
          result += stuff;
        }
        result += this.drawVisibleCards({ maxWidth, pos }, player.cards);
        break;
      case 'bot':
        result += '               ';
        result += this.drawVisibleCards({ maxWidth, pos }, player.cards);
        break;
      default:
        throw new Error('DRAW_INVALID_POS');
    }
    while (result.length < (maxWidth - last.length)) {
      result += stuff;
    }
    result += last;
    return result + '\r\n';
  }

  private drawActivePlayerSituation(
    { maxWidth, pos }: IDrawOptions,
    activePlayer: { name: string, cards: Card[], tokens: number, currentScore: number },
  ): string {
    const first = '║ ';
    const last = ' ║';
    const stuff = ' ';

    const tokens = activePlayer.tokens;
    let result = '';
    result += first;
    switch (pos) {
      case 'top':
        result += '               ';
        result += this.drawVisibleCards({ maxWidth, pos }, activePlayer.cards);
        break;
      case 'mid':
        result += '  \\ ' + (tokens <= 9 ? ' ' : '') + tokens + ' /       ';
        result += this.drawVisibleCards({ maxWidth, pos }, activePlayer.cards);
        break;
      case 'bot':
        result += '   \\__/        ';
        result += this.drawVisibleCards({ maxWidth, pos }, activePlayer.cards);
        break;
      default:
        throw new Error('DRAW_INVALID_POS');
    }
    while (result.length < (maxWidth - last.length)) {
      result += stuff;
    }
    result += last;
    return result + '\r\n';
  }

  private drawVisibleCards = ({ pos }: IDrawOptions, cards: Card[]): string => {
    let result = '';
    cards.sort((c1, c2) => c1.getValue() - c2.getValue() );
    switch (pos) {
      case 'top':
        cards.forEach((card, i, arr) => {
          const prevValue = i > 0 ? arr[i - 1].getValue() : -1000;
          const nextValue = i < (arr.length - 1) ? arr[i + 1].getValue() : +1000;
          if (prevValue === (card.getValue() - 1) && nextValue === (card.getValue() + 1)) {
            // au milieu
            result += '';
          } else {
            result += '┌──┐';
          }
        });
        break;
      case 'mid':
        cards.forEach((card, i, arr) => {
          const prevValue = i > 0 ? arr[i - 1].getValue() : -1000;
          const nextValue = i < (arr.length - 1) ? arr[i + 1].getValue() : +1000;
          if (prevValue === (card.getValue() - 1) && nextValue !== (card.getValue() + 1)) {
            // à la fin d'une série
            result += '.' + card.toString().substr(1, 4);
          } else if (prevValue === (card.getValue() - 1) && nextValue === (card.getValue() + 1)) {
            // au milieu d'une série
            result += '';
          } else if (prevValue !== (card.getValue() - 1) && nextValue === (card.getValue() + 1)) {
            // au début d'une série
            result += card.toString().substr(0, 3) + '.';
          } else {
            result += card.toString();
          }
        });
        break;
      case 'bot':
        cards.forEach((card, i , arr) => {
          const prevValue = i > 0 ? arr[i - 1].getValue() : -1000;
          const nextValue = i < (arr.length - 1) ? arr[i + 1].getValue() : +1000;
          if (prevValue === (card.getValue() - 1) && nextValue === (card.getValue() + 1)) {
            // au milieu
            result += '';
          } else {
            result += '└──┘';
          }
        });
        break;
      default:
        throw new Error('DRAW_INVALID_POS');
    }
    return result;
  }

  private drawQuestion = ({ maxWidth }: IDrawOptions, question: string): string => {
    const first = '║ ';
    const last = ' ║';
    const stuff = ' ';

    let result = '';
    result += first;
    result += question;
    while (result.length < (maxWidth - last.length)) {
      result += stuff;
    }
    result += last;

    return result + '\r\n';
  }

  private drawScores = ({ maxWidth }: IDrawOptions, scores: Array<[string, number]>): string => {
    let result = '';
    result += this.drawBorder({ maxWidth, pos: 'top'});
    result += this.drawTitle({ maxWidth }, '*\\o/* ! Scores de la partie ! *\\o/*');
    result += this.drawInBoxScores({ maxWidth, pos: 'top' }, scores);
    result += this.drawInBoxScores({ maxWidth, pos: 'mid1' }, scores);
    result += this.drawInBoxScores({ maxWidth, pos: 'mid2' }, scores);
    result += this.drawInBoxScores({ maxWidth, pos: 'bot' }, scores);
    result += this.drawBorder({ maxWidth, pos: 'bot'});
    return result;
  }

  private drawInBoxScores({ maxWidth, pos }: IDrawOptions, scores: Array<[string, number]>) {
    const first = '║ ';
    const last = ' ║';
    const stuff = ' ';

    let result = '';
    result += first;
    switch (pos) {
      case 'top':
        // cadre
        scores.forEach((s, i) => {
          result += i === 0
            ? '┌───────1er───────┐'
            : '┌───────' + (i + 1) + 'eme──────┐';
        });
        break;
      case 'mid1':
        // première ligne
        scores.forEach((s, i) => {
          const nameSize = s[0].length;
          let tempName = nameSize > 16
            ? '│ ' + s[0].substr(0, 16)
            : '│ ' + s[0];
          while (tempName.length < 18) {
            tempName += ' ';
          }
          tempName += '│';
          result += tempName;
        });
        break;
      case 'mid2':
        // deuxième ligne
        scores.forEach((s, i) => {
          // const scoreSize = s.score.toString().length;
          let tempScore = ('│ ' + s[1] + ' points').substr(0, 16);
          while (tempScore.length < 18) {
            tempScore += ' ';
          }
          tempScore += '│';
          result += tempScore;
        });
        break;
      case 'bot':
        // cadre fin
        scores.forEach((s, i) => {
          result += '└─────────────────┘';
        });
        break;
      default:
        throw new Error('DRAW_INVALID_POS');
    }
    while (result.length < maxWidth - last.length) {
      result += stuff;
    }
    result += last;
    return result + '\r\n';
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

interface IDrawOptions {
  maxWidth: number; // 120
  pos?: string; // top, mid, bot
}
