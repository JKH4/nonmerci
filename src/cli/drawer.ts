import { IBoardState } from '../core/board-helper';
import Card from '../core/card';

const DEFAULT_MAX_WIDTH = 120;

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

export default class Drawer {
  private maxWidth: number;

  constructor(maxWidth?: number) {
    this.maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
  }

  public drawBoard = ({ maxWidth }: IDrawOptions, boardstate: IBoardState): string => {
    let result = '';
    result += this.drawBorder({ maxWidth, pos: 'top' });
    result += this.drawTitle({ maxWidth },
      'Tour ' + boardstate.turn + ', Joueur Actif: ' + boardstate.activePlayer);
    result += this.drawBoardCardAndToken({ maxWidth, pos: 'top' }, boardstate);
    result += this.drawBoardCardAndToken({ maxWidth, pos: 'mid' }, boardstate);
    result += this.drawBoardCardAndToken({ maxWidth, pos: 'bot' }, boardstate);
    result += this.drawBorder({ maxWidth, pos: 'mid' });
    result += this.drawTitle({ maxWidth }, 'Les autres joueurs...');
    boardstate.players.filter((p) => p.name !== boardstate.activePlayer).forEach((player) => {
      result += this.drawOtherPlayerCards({ maxWidth, pos: 'top' }, player);
      result += this.drawOtherPlayerCards({ maxWidth, pos: 'mid' }, player);
      result += this.drawOtherPlayerCards({ maxWidth, pos: 'bot' }, player);
    });
    result += this.drawBorder({ maxWidth, pos: 'mid' });
    result += this.drawTitle({ maxWidth }, 'Votre situation... (' + boardstate.activePlayer + ')');
    const playerData = {
      cards: boardstate.players.find((p) => p.name === boardstate.activePlayer).cards,
      tokens: boardstate.players.find((p) => p.name === boardstate.activePlayer).hiddenTokens,
    };
    result += this.drawActivePlayerSituation({ maxWidth, pos: 'top' }, playerData);
    result += this.drawActivePlayerSituation({ maxWidth, pos: 'mid' }, playerData);
    result += this.drawActivePlayerSituation({ maxWidth, pos: 'bot' }, playerData);
    result += this.drawBorder({ maxWidth, pos: 'bot' });
    return result;
  }

  public drawBorder = ({ pos, maxWidth }: IDrawOptions): string => {
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

  public drawQuestion = ({ maxWidth }: IDrawOptions, question: string): string => {
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

  public drawScores = ({ maxWidth }: IDrawOptions, scores: Array<[string, number]>): string => {
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

  private drawBoardCardAndToken = ({ maxWidth, pos }: IDrawOptions, boardstate: IBoardState): string => {
    const first = '║ ';
    const last = ' ║';
    const stuff = ' ';

    const deckSize = boardstate.deckSize;
    const visibleCard = boardstate.visibleCard;
    const tokens = boardstate.visibleTokens;

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
        result += '  \\ ' + (tokens <= 9 ? ' ' : '') + tokens + ' /       '
          + (visibleCard <= 9 ? '│ ' + visibleCard + '│' : '│'  + visibleCard + '│');
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

  private drawOtherPlayerCards = ({ maxWidth, pos }: IDrawOptions, player: { name: string, cards: number[]}) => {
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
    activePlayer: { cards: number[], tokens: number },
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

  private drawVisibleCards = ({ pos }: IDrawOptions, cards: number[]): string => {
    let result = '';
    cards.sort((c1, c2) => c1 - c2 );
    switch (pos) {
      case 'top':
        cards.forEach((card, i, arr) => {
          const prevValue = i > 0 ? arr[i - 1] : -1000;
          const nextValue = i < (arr.length - 1) ? arr[i + 1] : +1000;
          if (prevValue === (card - 1) && nextValue === (card + 1)) {
            // au milieu
            result += '';
          } else {
            result += '┌──┐';
          }
        });
        break;
      case 'mid':
        cards.forEach((card, i, arr) => {
          const prevValue = i > 0 ? arr[i - 1] : -1000;
          const nextValue = i < (arr.length - 1) ? arr[i + 1] : +1000;
          if (prevValue === (card - 1) && nextValue !== (card + 1)) {
            // à la fin d'une série
            result += '.' + (card <= 9 ? '│ ' + card + '│' : '│'  + card + '│').substr(1, 4);
          } else if (prevValue === (card - 1) && nextValue === (card + 1)) {
            // au milieu d'une série
            result += '';
          } else if (prevValue !== (card - 1) && nextValue === (card + 1)) {
            // au début d'une série
            result += (card <= 9 ? '│ ' + card + '│' : '│'  + card + '│').substr(0, 3) + '.';
          } else {
            result += (card <= 9 ? '│ ' + card + '│' : '│'  + card + '│');
          }
        });
        break;
      case 'bot':
        cards.forEach((card, i , arr) => {
          const prevValue = i > 0 ? arr[i - 1] : -1000;
          const nextValue = i < (arr.length - 1) ? arr[i + 1] : +1000;
          if (prevValue === (card - 1) && nextValue === (card + 1)) {
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

export interface IDrawOptions {
  maxWidth: number; // 120
  pos?: string; // top, mid, bot
}
