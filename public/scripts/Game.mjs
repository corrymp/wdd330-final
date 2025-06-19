import Board from './Board.mjs';
import History from './History.mjs';
import Analysis from './Analysis.mjs';
import { sleep, pawn, king, comboShorthands } from './utils.mjs';

window.useApis = true;
window.useLichess = true;
window.useWikibook = true;
window.useStockfish = true;
window.alwaysRobot = false;

export default class Game {
    // false = white, true = black
    #turn = null;
    get turn() { return this.#turn }
    set turn(turn) { this.#turn = turn; }

    #board = null;
    get board() { return this.#board; }
    set board(board) { this.#board = board; }

    #history = null;
    get history() { return this.#history; }
    get lastHistory() { return this.#history.lastHistory; }
    set history(moveString) { this.#history.addHistory(moveString).updateDisplay(); }

    #fullMove = null;
    get fullmoveNumber() { return this.#fullMove; }
    set fullmoveNumber(fullMove) { this.#fullMove = fullMove; }

    #halfMoves = null;
    get halfmoveClock() { return this.#halfMoves; }
    set halfmoveClock(halfMove) { this.#halfMoves = halfMove; }

    #stockfishPlayer = null;
    get stockfishPlayer() { 
        if(alwaysRobot) return this.#turn;
        return this.#stockfishPlayer }
    set stockfishPlayer(stockfishPlayer) { this.#stockfishPlayer = stockfishPlayer; }

    #analysis = null;
    get analysis() { return this.#analysis; }
    #includeOpeningTheory = null;

    get fenString() { return this.buildFenString(); }

    constructor(main, boardEl, historyEl, analysisEl, setup, turn, stockfishPlayer) {
        this.main = main;
        this.#board = new Board(main, this, boardEl, setup);
        this.#turn = turn ?? false;
        this.#history = new History(main, this, historyEl);
        this.#fullMove = 1;
        this.#halfMoves = 0;
        this.#stockfishPlayer = stockfishPlayer ?? true;
        this.#includeOpeningTheory = true;
        this.#analysis = new Analysis(this, analysisEl);
    }

    buildFenString() {

        // piece placement
        const piecePlacement = this.board.boardArray.map(row =>
            row.map(space => space.piece.real ? space.piece.notation : ',').join('')
                .replace(/,{8}/g, 8)
                .replace(/,{7}/g, 7)
                .replace(/,{6}/g, 6)
                .replace(/,{5}/g, 5)
                .replace(/,{4}/g, 4)
                .replace(/,,,/g, 3)
                .replace(/,,/g, 2)
                .replace(/,/g, 1)
        ).join('/');

        // read the name lol
        const nextColorToMove = this.turn ? 'b' : 'w';

        // castling availability
        const castlingAVailability = (() => {

            // whether each king has moved before
            const whiteKing = !this.board.whiteKing.hasMoved;
            const blackKing = !this.board.blackKing.hasMoved;

            // early return if both have moved
            if (!whiteKing && !blackKing) return '-';

            let str = '';

            if(!this.board.whiteKSRook.hasMoved) str += 'K';
            if(!this.board.whiteQSRook.hasMoved) str += 'Q';
            if(!this.board.blackKSRook.hasMoved) str += 'k';
            if(!this.board.blackQSRook.hasMoved) str += 'q';

            return str || '-';

            // does the following code on ranks 1 & 8
            //return [0, 7].map(
            //    y => {
            //        // gets the propper king for the rank and early returns if there is none
            //        if (!(y === 0 ? whiteKing : blackKing)) return '';
//
            //        // does the following for the a and h files... I leave the explanasion as an excersice to the reader
            //        [7, 0].map(x => this.board.space(xyToIndex(x, y)).piece.hasMoved ? '' : (x === 0 ? 'q' : 'k')[y === 0 ? 'toUpperCase' : 'toLowerCase']()).join('');
//
            //        // returns the joined strings or - if they are empty
            //    }).join('') || '-';
        })();

        // en Passant target
        const epTargetSquare = (() => {
            const epTarg = this.board.enPassantTarget;
            if (!epTarg) return '-';
            return `${epTarg.file}${epTarg.rank}`;
        })();

        // an' put it all together!
        return `${piecePlacement} ${nextColorToMove} ${castlingAVailability} ${epTargetSquare} ${this.halfmoveClock} ${this.fullmoveNumber}`;
    }

    updateHistory() {
        const from = this.board.selected;
        const to = this.board.selectionTarget;

        if (from.piece.type === king && !from.piece.hasMoved && ['c', 'g'].includes(to.file)) return this.history = `${to.file === 'g' ? '' : '0-'}0-0`;

        // piece symbol
        const type = from.piece.type === pawn
            ? ''
            :

            from.piece.notation.toUpperCase();


        // clear ambiguise notation
        const disambiguate = (() => {
            /*
                Determine ambiguity:
                - Find all pieces of the same type and color
                - see if the target square is in their list of legal moves
                - if yes, disambiguate
                - else, stick with minimal
            */

            const allList = [];

            console.log(this.#board.spaces.map(space => {
                if (space === to) return '+'
                if (space === from) return 'O'
                if (!space.piece.real) return '_';
                const piece = space.piece;
                if (piece.type === to.piece.type && piece.color === to.piece.color && piece.moves.map(m => m.join('')).includes(to.xy.join(''))) {
                    allList.push(piece);
                    return 'X';
                }
                return piece.notation;
            }).join('').replace(/(.{8})/g, '\n|$1|'));

            const allRank = [];
            const allFile = [];

            allList.forEach(piece => {
                allRank.push(piece.space.rank);
                allFile.push(piece.space.file);
            });

            if (allList.length) {
                if (allFile.includes(from.File) && allRank.includes(from.rank)) return from.file + from.rank;
                else if (allRank.includes(from.rank)) return from.file;
                else if (allFile.includes(from.File)) return from.rank;
                else return from.file;
            }
            return '';
        })();

        const isCapture = to.piece.real;
        const isEnPassant = to === this.board.enPassantTarget;
        const dest = to.file + to.rank;

        const notes = (() => {
            let str = '';
            if (isEnPassant) str += ' e.p.';
            return str;
        })();

        return this.history = `${type}${disambiguate}${(isCapture || isEnPassant) ? 'x' : ''}${dest}${notes}`;
    }

    async nextTurn() {

        const getWikibook = async url => {
            const wikibookApiRes = await this.main.wikibookApi.callApi({
                titles: url,
                origin: '*',
                action: 'query',
                prop: 'extracts',
                formatversion: 2,
                format: 'json',
                exchars: 1200,
                redirects: 1
            });

            if (wikibookApiRes) {
                if (wikibookApiRes.query.pages[0].missing)
                    return this.#includeOpeningTheory = false;

                else if (wikibookApiRes.query.pages[0].extract)
                    return wikibookApiRes.query.pages[0];

                else {
                    return
                }
            }
        }

        if (this.#turn) this.#fullMove++;
        this.#turn = !this.#turn;

        const fen = this.fenString;
        const historyUrl = `Chess_Opening_Theory${this.history.historyAsUrl}`;

        let lichess = null;
        let openingTheory = null;

        if (useApis) {
            if (useLichess) {
                const lichessApiRes = await this.main.lichessApi.callApi({ fen, multiPv: 1 });
                if (lichessApiRes.pvs) lichess = lichessApiRes.pvs[0];
                else lichess = { moves: 'I got nothing for that one, sorry!' };
            }

            if (useWikibook && this.#includeOpeningTheory) openingTheory = await getWikibook(historyUrl);
        }

        this.analysis.addAnalysis(historyUrl, lichess, openingTheory);

        if (useApis && useStockfish && this.turn === this.stockfishPlayer) {
            const chessApiRes = await this.main.chessApi.callApi({ fen, depth: 10 });

            if (!chessApiRes || chessApiRes.type === 'error') {
                alert(`\
There was an issue getting the next move, so you will need to make the move manually.
Check the console for more details.
(press F12 on your keyboard to open the console)`);
                if (chessApiRes) console.error('There was an issue getting the next move.\nThis is what I got:', chessApiRes);
                return;
            }

            const from = this.board.space(...chessApiRes.from.split(''), true);
            const to = this.board.space(...chessApiRes.to.split(''), true);

            // gotta make it *d r a m a t i c*
            await sleep(300);
            from.click();

            await sleep(700);
            to.click();

            await sleep(200);
            this.analysis.bar = chessApiRes.winChance;
        }

        this.saveGame();

        return this;
    }

    loadSave(save) {
        const fen = save.game.split(' ');
        const board = fen[0].split('');

        const setup = Array.from({ length: 8 }, () => Array(8).fill(null));

        for (let i = 0, rank = 0, file = 0; i < board.length; i++) {
            const char = board[i];

            if(char === '/') {
                file = 0;
                rank++;
                continue;
            }
            
            if(!isNaN(char * 1)){
                file += (char*1);
                continue;
            }
            if(comboShorthands[board[i]]) setup[rank][file] = board[i];
            file++;
        }

        this.turn = fen[1] === 'b';

        let castlingRights = null;
        let enPassantTarget = null;
        if (fen[2] !== '-') castlingRights = fen[2];
        if (fen[3] !== '-') enPassantTarget = fen[3];

        this.halfmoveClock = fen[4] * 1;
        this.fullmoveNumber = fen[5] * 1;

        this.#board.startingPosition = setup;

        this.#board.setupBoard(castlingRights, enPassantTarget);

        const history = save.history;
        const analysis = save.analysis;

        for(let i = 0, j = 0; i < history.length; i++) {
            const histLine = history[i];
            const analysisWhite = analysis[j++];
            const analysisBlack = analysis[j++];

            this.fullmoveNumber = histLine.turn*1;

            this.history.addHistory(histLine.white).updateDisplay();

            this.analysis.addAnalysis(
                analysisWhite.url,
                analysisWhite.lichess,
                analysisWhite.openingTheory
            );

            if(histLine.black) {
                this.history.addHistory(histLine.black).updateDisplay();

                this.analysis.addAnalysis(
                    analysisBlack.url,
                    analysisBlack.lichess,
                    analysisBlack.openingTheory
                );
            }
        }

        if(save.bar) this.analysis.bar = save.bar;

    }

    saveGame() {
        this.lastSaved = Date.now();

        const save = {
            time: this.lastSaved,
            game: this.fenString,
            history: this.history.history,
            analysis: this.analysis.analysis,
            bar: this.analysis.bar
        };

        localStorage.setItem('saveData', JSON.stringify(save));
    }

    deleteSave() {
        localStorage.setItem('saveData', null);
        this.lastSaved = null;
        window.location.reload();
    }
}


// void {
//     FENnotes: {
//         spaceSeperatedFields: {
//             piecePlacement: {
//                 p: 'black pawn',
//                 r: 'black rook',
//                 n: 'black knight',
//                 b: 'black bishop',
//                 q: 'black queen',
//                 k: 'black king',
//                 P: 'white pawn',
//                 R: 'white rook',
//                 N: 'white knight',
//                 B: 'white bishop',
//                 Q: 'white queen',
//                 K: 'white king',
//                 number: '{number} empty spaces',
//                 '/': 'row brake'
//             },
//             nextColorToMove: {
//                 w: "white's turn",
//                 b: "black's turn"
//             },
//             castlingAvailability: {
//                 K: 'white kingside',
//                 Q: 'white queenside',
//                 k: 'black kingside',
//                 q: 'black queenside',
//                 '-': 'none',
//                 examples: {
//                     KQkq: 'no kings or rooks have moved',
//                     Q: 'only the white king may castle, and only queenside',
//                     '-': 'All rooks or kings have been moved and castling is no longer possible'
//                 }
//             },
//             enPassantTargetSquare: {
//                 letter: 'board row',
//                 number: 'board col',
//                 '-': 'none',
//                 examples: { e3: 'pawn on e4 may be captured by en passant' }
//             },
//             halfmoveClock: {
//                 number: 'total player moves since last capture or pawn move; draw at 100',
//                 examples: {
//                     99: 'the game draws if black does not capture a piece or move a pawn'
//                 }
//             },
//             fullmoveNumber: {
//                 number: 'current fullmove; starts at one, goes up when black moves',
//                 examples: {
//                     1: 'the game has just started and black has not moved yet',
//                     50: 'black is about to make their 50th move'
//                 }
//             },
//             examples: {
//                 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': 'start of game'
//             }
//         }
//     },

//     PGNnotes: {
//         keyValuePair: [
//             'enclosed by "[]"',
//             'seperated by space'
//         ],
//         values: '"quoted"',
//         keys: {
//             main: {
//                 Event: 'name of tourney or match event',
//                 Site: 'location of event (city, region 3-letter-country) (example: New York City, NY USA)',
//                 Date: 'game start date',
//                 Round: 'game number in event',
//                 White: '"lastname, firstname" of white',
//                 Black: '"lastname, firstname" of black',
//                 Result: '{white score}-{black score} ({*} if ongoing)',
//                 Movetext: 'algebraic notation of moves'
//             },
//             optional: {
//                 Annotator: 'person annotating',
//                 PlyCount: 'total halfmoves played',
//                 TimeControl: '{moves per seconds}:{sudden death seconds}',
//                 Time: 'local game start time (HH:MM:SS)',
//                 Termination: [
//                     'game end details',
//                     [
//                         'abandoned',
//                         'adjudication',
//                         'death',
//                         'emergency',
//                         'normal',
//                         'rules infraction',
//                         'time forfeit',
//                         'unterminated'
//                     ]
//                 ],
//                 Mode: 'OTB or ICS (over-the-board or internet chess server)',
//                 FEN: 'initial board FEN string',
//                 SetUp: '1 (must be used if FEN is present)'
//             }
//         }
//     },

//     AlgebraicNotationNotes: {
//         spaces: [
//             'listed in letter-number form',
//             'column/file = letters h-a',
//             'row/rank = numbers 1-8',
//             `a1 = lower-left hand space from white's view`
//         ],
//         pieces: [
//             'each non-pawn listed with uppercase letter',
//             {
//                 K: 'king',
//                 Q: 'queen',
//                 R: 'rook',
//                 B: 'bishop',
//                 N: 'knight'
//             },
//             'may also use piece symbols'
//         ],
//         moves: {
//             nonPawn: '{piece}{file}{rank}',
//             pawn: '{file}{rank}',
//             capture: '{piece}x{file}{rank}',
//             pawnCapture: '{starting file}x{ending file}{rank}',
//             enPassant: '{starting file}x{ending file}{rank} e.p.'
//         },
//         disambiguation: {
//             multiplePossiblePieces: [
//                 '{piece}{starting file}{ending file}{rank}',
//                 '{piece}{starting rank}{file}{ending rank}',
//                 '{piece}{start file}{start rank}{end file}{end rank}'
//             ],
//             multiplePossibleCaptures: [
//                 '{piece}{starting file}x{ending file}{rank}',
//                 '{piece}{starting rank}x{file}{ending rank}',
//                 '{piece}{start file}{start rank}x{end file}{end rank}'
//             ]
//         },
//         promotion: [
//             '{file}{rank}{piece to become}',
//             '{file}{rank}={piece to become}',
//             '{file}{rank}({piece to become})'
//         ],
//         castling: {
//             kingside: '0-0',
//             queenside: '0-0-0'
//         },
//         check: '{move notation}+',
//         checkmate: '{move notation}#',
//         gameEnd: {
//             whiteWin: '1-0',
//             blackWin: '0-1',
//             draw: '½-½',
//             whiteForfeit: '0-½',
//             blackForfeit: '½-0',
//             lossByDefault: [
//                 '+/-',
//                 '-/+',
//                 '-/-'
//             ]
//         },
//         format: {
//             column: [
//                 '1. {white move notation} {black move notation}',
//                 '2. {white move notation} {black move notation}'
//             ],
//             horizontal: '1. {white move notation} {black move notation} 2. {white move notation} {black move notation}',
//             withComments: [
//                 '1. {white move notation} {black move notation}',
//                 '{comment after both moves}',
//                 '2. {white move notation}',
//                 '{comment after white before black}',
//                 '2...{black move notation}',
//                 '3. {white move notation} {black move notation}'
//             ]
//         },
//         annotationSymbols: {
//             moves: {
//                 '!!': 'brilliant move',
//                 '!': 'good move',
//                 '!?': 'interesting move',
//                 '?!': 'dubious move',
//                 '?': 'bad move',
//                 '??': 'blunder',
//                 '□': 'forced'
//             },
//             positions: {
//                 '=': 'equal chances',
//                 '+/=': 'white slight move plus',
//                 '=/+': 'black slight move plus',
//                 '+/-': 'white clear move plus',
//                 '-/+': 'black clear move plus',
//                 '+-': 'white winning advantage',
//                 '-+': 'black winning advantage',
//                 '∞': 'toss-up',
//                 '=/∞': 'down player has compensation'
//             }
//         }
//     },

//     LongAlgebraicNotationNotes: {
//         moves: {
//             nonCapture: '{piece}{start file}{start rank}-{end file}{end rank}',
//             capture: '{piece}{start file}{start rank}x{end file}{end rank}'
//         }
//     }
// }
