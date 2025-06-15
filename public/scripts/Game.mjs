import Board from './Board.mjs';
import History from './History.mjs';

class Game {
    // false = white, true = black
    #turn = null;
    #board = null;
    #history = null;
    #fullMove = null;
    #halfMoves = null;

    constructor(main, boardEl, setup, turn) {
        this.main = main;
        this.#board = new Board(this, boardEl, setup);
        this.#turn = turn ?? false;
        this.#board.setupBoard();
        this.#history = new History(this);
        this.#fullMove = 1;
        this.#halfMoves = 0;
    }

    get fenString() {return this.buildFenString();}

    buildFenString() {

        // piece placement
        const piecePlacement = this.board.boardArray.map(row => 
            row.map(space => space.piece.real ? space.piece.notation : ',').join('')
                .replace(/,{8}/g,8)
                .replace(/,{7}/g,7)
                .replace(/,{6}/g,6)
                .replace(/,{5}/g,5)
                .replace(/,{4}/g,4)
                .replace(/,,,/g,3)
                .replace(/,,/g,2)
                .replace(/,/g,1)
        ).join('/');

        // read the name lol
        const nextColorToMove = this.turn ? 'b' : 'w';

        // castling availability
        const castlingAVailability = (()=>{

            // whether each king has moved before
            const whiteKing = !this.board.whiteKing.hasMoved;
            const blackKing = !this.board.blackKing.hasMoved;

            // early return if both have moved
            if(!whiteKing && !blackKing) return '-';

            // does the following code on ranks 1 & 8
            return [1,8].map(rank => {

                // gets the propper king for the rank and early returns if there is none
                if(!(rank === 1 ? whiteKing : blackKing)) return '';

                // does the following for the a and h files... I leave the explanasion as an excersice to the reader
                return ['a','h'].map(file => this.board.space(file, rank).hasMoved ? '' : (file === 'h' ? 'k' : 'q')[rank === 1 ? 'toUpperCase' : 'toLowerCase']()).join('');

            // returns the joined strings or - if they are empty
            }).join('') || '-';
        })();

        // en Passant target
        const epTargetSquare = (()=>{

            // gets the current en Passant target
            const epTarg = this.board.enPassantTarget;

            // returns the target notation or - if there is none
            return epTarg ? `${epTarg.file}${epTarg.rank}` : '-';
        })();

        // an' put it all together!
        return `${piecePlacement} ${nextColorToMove} ${castlingAVailability} ${epTargetSquare} ${this.halfmoveClock} ${this.fullmoveNumber}`;
    }

    get history() {}
    set history(moveString) {
        this.#history.addHistory(moveString);
        return this;
    }

    updateHistory() {
        const from = this.board.selected;
        const to = this.board.selectionTarget;


        // clear ambiguise notation
        const disambiguate = (()=>{

            let str = '';

            /*
                Determine ambiguity:
                - Find all pieces of the same type and color
                - see if the target square is in their list of legal moves
                - if yes, disambiguate
                - else, stick with minimal
            */

            let allList = [];

            const allOfTypeAndColor = this.#board.spaces.map(space => {
                if(space === to) return '+'
                if(space === from) return 'O'
                if(!space.piece.real) return'_';
                const piece = space.piece;
                if(piece.type === to.piece.type && piece.color === to.piece.color && piece.moves.map(m => m.join('')).includes(to.xy.join(''))) {
                    allList.push(piece);
                    return 'X';
                }
                return piece.notation;
            }).join('').replace(/(.{8})/g,'\n|$1|');

            const allRank = [];
            const allFile = [];

            allList.forEach(piece => {
                allRank.push(piece.space.rank);
                allFile.push(piece.space.file);
            });

            if(allList.length) {
                if(allFile.includes(from.File) && allRank.includes(from.rank)) str = from.file + from.rank;
                else if(allRank.includes(from.rank)) str = from.file;
                else if(allFile.includes(from.File)) str = from.rank;
                else str = from.file
            }

            console.log(allOfTypeAndColor, allList, allRank, allFile, from.rank, from.file);

            return str;
        })();

        // piece symbol
        const type = from.piece.type === 'pawn' 
            ? '' 
            : from.piece.notation.toUpperCase();

        const isCapture = '';
        const dest = to.file + to.rank;
        const notes = '';

        const moveStr = `${type}${disambiguate}${isCapture ? 'x' : ''}${dest}${notes}`;
        console.log(moveStr);
    }

    get turn() {return this.#turn}
    set turn(turn) {this.#turn = turn; return this;}
    nextTurn() {
        if(this.#turn) this.#fullMove++;
        this.#turn = !this.#turn; 
        console.log(this.fenString);
        return this;
    }

    get board() {return this.#board;}
    set board(board) {this.#board = board; return this;}

    get halfmoveClock() {return this.#halfMoves;}
    get fullmoveNumber() {return this.#fullMove;}

    set halfmoveClock(halfMove ) { this.#halfMoves = halfMove; return this;}
    set fullmoveNumber(fullMove) { this.#fullMove = fullMove; return this;}

}

export default Game;

const notes = void {
    FENnotes: {
        spaceSeperatedFields: {
            piecePlacement: {
                p: 'black pawn',
                r: 'black rook',
                n: 'black knight',
                b: 'black bishop',
                q: 'black queen',
                k: 'black king',
                P: 'white pawn',
                R: 'white rook',
                N: 'white knight',
                B: 'white bishop',
                Q: 'white queen',
                K: 'white king',
                number: '{number} empty spaces',
                '/': 'row brake'
            },
            nextColorToMove: {
                w: "white's turn",
                b: "black's turn"
            },
            castlingAvailability: {
                K: 'white kingside',
                Q: 'white queenside',
                k: 'black kingside',
                q: 'black queenside',
                '-': 'none',
                examples: {
                    KQkq: 'no kings or rooks have moved',
                    Q: 'only the white king may castle, and only queenside',
                    '-': 'All rooks or kings have been moved and castling is no longer possible'
                }
            },
            enPassantTargetSquare: {
                letter: 'board row',
                number: 'board col',
                '-': 'none',
                examples: { e3: 'pawn on e4 may be captured by en passant' }
            },
            halfmoveClock: {
                number: 'total player moves since last capture or pawn move; draw at 100',
                examples: {
                    99: 'the game draws if black does not capture a piece or move a pawn'
                }
            },
            fullmoveNumber: {
                number: 'current fullmove; starts at one, goes up when black moves',
                examples: {
                    1: 'the game has just started and black has not moved yet',
                    50: 'black is about to make their 50th move'
                }
            },
            examples: {
                'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': 'start of game'
            }
        }
    },

    PGNnotes: {
        keyValuePair: [
            'enclosed by "[]"',
            'seperated by space'
        ],
        values: '"quoted"',
        keys: {
            main: {
                Event: 'name of tourney or match event',
                Site: 'location of event (city, region 3-letter-country) (example: New York City, NY USA)',
                Date: 'game start date',
                Round: 'game number in event',
                White: '"lastname, firstname" of white',
                Black: '"lastname, firstname" of black',
                Result: '{white score}-{black score} ({*} if ongoing)',
                Movetext: 'algebraic notation of moves'
            },
            optional: {
                Annotator: 'person annotating',
                PlyCount: 'total halfmoves played',
                TimeControl: '{moves per seconds}:{sudden death seconds}',
                Time: 'local game start time (HH:MM:SS)',
                Termination: [
                    'game end details',
                    [
                        'abandoned',
                        'adjudication',
                        'death',
                        'emergency',
                        'normal',
                        'rules infraction',
                        'time forfeit',
                        'unterminated'
                    ]
                ],
                Mode: 'OTB or ICS (over-the-board or internet chess server)',
                FEN: 'initial board FEN string',
                SetUp: '1 (must be used if FEN is present)'
            }
        }
    },

    AlgebraicNotationNotes: {
        spaces: [
            'listed in letter-number form',
            'column/file = letters h-a',
            'row/rank = numbers 1-8',
            `a1 = lower-left hand space from white's view`
        ],
        pieces: [
            'each non-pawn listed with uppercase letter',
            {
                K: 'king',
                Q: 'queen',
                R: 'rook',
                B: 'bishop',
                N: 'knight'
            },
            'may also use piece symbols'
        ],
        moves: {
            nonPawn: '{piece}{file}{rank}',
            pawn: '{file}{rank}',
            capture: '{piece}x{file}{rank}',
            pawnCapture: '{starting file}x{ending file}{rank}',
            enPassant: '{starting file}x{ending file}{rank} e.p.'
        },
        disambiguation: {
            multiplePossiblePieces: [
                '{piece}{starting file}{ending file}{rank}',
                '{piece}{starting rank}{file}{ending rank}',
                '{piece}{start file}{start rank}{end file}{end rank}'
            ],
            multiplePossibleCaptures: [
                '{piece}{starting file}x{ending file}{rank}',
                '{piece}{starting rank}x{file}{ending rank}',
                '{piece}{start file}{start rank}x{end file}{end rank}'
            ]
        },
        promotion: [
            '{file}{rank}{piece to become}',
            '{file}{rank}={piece to become}',
            '{file}{rank}({piece to become})'
        ],
        castling: {
            kingside: '0-0',
            queenside: '0-0-0'
        },
        check: '{move notation}+',
        checkmate: '{move notation}#',
        gameEnd: {
            whiteWin: '1-0',
            blackWin: '0-1',
            draw: '½-½',
            whiteForfeit: '0-½',
            blackForfeit: '½-0',
            lossByDefault: [
                '+/-',
                '-/+',
                '-/-'
            ]
        },
        format: {
            column: [
                '1. {white move notation} {black move notation}',
                '2. {white move notation} {black move notation}'
            ],
            horizontal: '1. {white move notation} {black move notation} 2. {white move notation} {black move notation}',
            withComments: [
                '1. {white move notation} {black move notation}',
                '{comment after both moves}',
                '2. {white move notation}',
                '{comment after white before black}',
                '2...{black move notation}',
                '3. {white move notation} {black move notation}'
            ]
        },
        annotationSymbols: {
            moves: {
                '!!': 'brilliant move',
                '!': 'good move',
                '!?': 'interesting move',
                '?!': 'dubious move',
                '?': 'bad move',
                '??': 'blunder',
                '□': 'forced'
            },
            positions: {
                '=': 'equal chances',
                '+/=': 'white slight move plus',
                '=/+': 'black slight move plus',
                '+/-': 'white clear move plus',
                '-/+': 'black clear move plus',
                '+-': 'white winning advantage',
                '-+': 'black winning advantage',
                '∞': 'toss-up',
                '=/∞': 'down player has compensation'
            }
        }
    },

    LongAlgebraicNotationNotes: {
        moves: {
            nonCapture: '{piece}{start file}{start rank}-{end file}{end rank}',
            capture: '{piece}{start file}{start rank}x{end file}{end rank}'
        }
    }
}
