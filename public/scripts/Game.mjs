import Board from "./Board.mjs"

/**
 * @param {Board} board 
 */
const FenString = (board) => {
    
}



const FENnotes = {
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
            examples: {e3: 'pawn on e4 may be captured by en passant'}
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
}

const PGNnotes = {
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
}

const AlgebraicNotationNotes = {
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
}

const LongAlgebraicNotationNotes = {
    moves: {
        nonCapture: '{piece}{start file}{start rank}-{end file}{end rank}',
        capture: '{piece}{start file}{start rank}x{end file}{end rank}'
    }
}
