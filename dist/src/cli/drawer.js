"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
class Drawer {
    constructor(maxWidth) {
        this.drawBoard = ({ maxWidth }, boardstate) => {
            let result = '';
            result += this.drawBorder({ maxWidth, pos: 'top' });
            result += this.drawTitle({ maxWidth }, 'Tour ' + boardstate.turn + ', Joueur Actif: ' + boardstate.activePlayer);
            result += this.drawBoardCardAndToken({ maxWidth, pos: 'top' }, boardstate);
            result += this.drawBoardCardAndToken({ maxWidth, pos: 'mid' }, boardstate);
            result += this.drawBoardCardAndToken({ maxWidth, pos: 'bot' }, boardstate);
            result += this.drawBorder({ maxWidth, pos: 'mid' });
            result += this.drawTitle({ maxWidth }, 'Les autres joueurs...');
            boardstate.board.playerCards.filter((p) => p.name !== boardstate.activePlayer).forEach((player) => {
                result += this.drawOtherPlayerCards({ maxWidth, pos: 'top' }, player);
                result += this.drawOtherPlayerCards({ maxWidth, pos: 'mid' }, player);
                result += this.drawOtherPlayerCards({ maxWidth, pos: 'bot' }, player);
            });
            result += this.drawBorder({ maxWidth, pos: 'mid' });
            result += this.drawTitle({ maxWidth }, 'Votre situation... (' + boardstate.activePlayer + ')');
            const playerData = {
                cards: boardstate.board.playerCards.find((p) => p.name === boardstate.activePlayer).cards,
                tokens: boardstate.privateData.hiddenTokens,
            };
            result += this.drawActivePlayerSituation({ maxWidth, pos: 'top' }, playerData);
            result += this.drawActivePlayerSituation({ maxWidth, pos: 'mid' }, playerData);
            result += this.drawActivePlayerSituation({ maxWidth, pos: 'bot' }, playerData);
            result += this.drawBorder({ maxWidth, pos: 'bot' });
            return result;
        };
        this.drawBorder = ({ pos, maxWidth }) => {
            const first = pos === 'top' ? '╔'
                : pos === 'mid' ? '╠'
                    : '╚';
            const last = pos === 'top' ? '╗'
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
        };
        this.drawQuestion = ({ maxWidth }, question) => {
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
        };
        this.drawScores = ({ maxWidth }, scores) => {
            let result = '';
            result += this.drawBorder({ maxWidth, pos: 'top' });
            result += this.drawTitle({ maxWidth }, '*\\o/* ! Scores de la partie ! *\\o/*');
            result += this.drawInBoxScores({ maxWidth, pos: 'top' }, scores);
            result += this.drawInBoxScores({ maxWidth, pos: 'mid1' }, scores);
            result += this.drawInBoxScores({ maxWidth, pos: 'mid2' }, scores);
            result += this.drawInBoxScores({ maxWidth, pos: 'bot' }, scores);
            result += this.drawBorder({ maxWidth, pos: 'bot' });
            return result;
        };
        this.drawTitle = ({ maxWidth }, title) => {
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
        };
        this.drawBoardCardAndToken = ({ maxWidth, pos }, boardstate) => {
            const first = '║ ';
            const last = ' ║';
            const stuff = ' ';
            const deckSize = boardstate.board.deckSize;
            const visibleCard = boardstate.board.visibleCard;
            const tokens = boardstate.board.visibleTokens;
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
                        + (visibleCard <= 9 ? '│ ' + visibleCard + '│' : '│' + visibleCard + '│');
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
        };
        this.drawOtherPlayerCards = ({ maxWidth, pos }, player) => {
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
        };
        this.drawVisibleCards = ({ pos }, cards) => {
            let result = '';
            cards.sort((c1, c2) => c1 - c2);
            switch (pos) {
                case 'top':
                    cards.forEach((card, i, arr) => {
                        const prevValue = i > 0 ? arr[i - 1] : -1000;
                        const nextValue = i < (arr.length - 1) ? arr[i + 1] : +1000;
                        if (prevValue === (card - 1) && nextValue === (card + 1)) {
                            // au milieu
                            result += '';
                        }
                        else {
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
                            result += '.' + (card <= 9 ? '│ ' + card + '│' : '│' + card + '│').substr(1, 4);
                        }
                        else if (prevValue === (card - 1) && nextValue === (card + 1)) {
                            // au milieu d'une série
                            result += '';
                        }
                        else if (prevValue !== (card - 1) && nextValue === (card + 1)) {
                            // au début d'une série
                            result += (card <= 9 ? '│ ' + card + '│' : '│' + card + '│').substr(0, 3) + '.';
                        }
                        else {
                            result += (card <= 9 ? '│ ' + card + '│' : '│' + card + '│');
                        }
                    });
                    break;
                case 'bot':
                    cards.forEach((card, i, arr) => {
                        const prevValue = i > 0 ? arr[i - 1] : -1000;
                        const nextValue = i < (arr.length - 1) ? arr[i + 1] : +1000;
                        if (prevValue === (card - 1) && nextValue === (card + 1)) {
                            // au milieu
                            result += '';
                        }
                        else {
                            result += '└──┘';
                        }
                    });
                    break;
                default:
                    throw new Error('DRAW_INVALID_POS');
            }
            return result;
        };
        this.maxWidth = maxWidth || DEFAULT_MAX_WIDTH;
    }
    drawActivePlayerSituation({ maxWidth, pos }, activePlayer) {
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
    drawInBoxScores({ maxWidth, pos }, scores) {
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
exports.default = Drawer;
//# sourceMappingURL=drawer.js.map