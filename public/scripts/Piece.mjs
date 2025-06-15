import Move from './Move.mjs';

//#region type
const pawn          = 'pawn';
const rook          = 'rook';
const knight        = 'knight';
const bishop        = 'bishop';
const queen         = 'queen';
const king          = 'king';

const pawnSymbol    = '♙';
const rookSymbol    = '♖';
const knightSymbol  = '♘';
const bishopSymbol  = '♗';
const queenSymbol   = '♕';
const kingSymbol    = '♔';

const pawnValue     = 1;
const rookValue     = 5;
const knightValue   = 3;
const bishopValue   = 3;
const queenValue    = 9;
const kingValue     = Infinity;

const types = {
    pawn, 
    rook, 
    knight, 
    bishop, 
    queen, 
    king
};

const typeShorthands = { 
    p: pawn,
    r: rook,
    n: knight,
    b: bishop,
    q: queen,
    k: king
};

const symbols = {
    pawn:   pawnSymbol,
    rook:   rookSymbol,
    knight: knightSymbol,
    bishop: bishopSymbol,
    queen:  queenSymbol,
    king:   kingSymbol
};

const notations = {
    pawn:   'p',
    rook:   'r',
    knight: 'n',
    bishop: 'b',
    queen:  'q',
    king:   'k'
}

const values = {
    pawn:   pawnValue,
    rook:   rookValue,
    knight: knightValue,
    bishop: bishopValue,
    queen:  queenValue,
    king:   kingValue
}

//#endregion type

//#region color
const white = 'white';
const black = 'black'

const colors = {white,  black};

const colorShortands = {
    w: white,
    b: black
};

const colorCodes = {
    white: 'var(--off-white)',
    black: 'var(--off-black)'
}

//#endregion color

//#region combo
const comboShorthands = {
    p: { color: black, type: pawn   },
    r: { color: black, type: rook   },
    n: { color: black, type: knight },
    b: { color: black, type: bishop },
    q: { color: black, type: queen  },
    k: { color: black, type: king   },

    P: { color: white, type: pawn   },
    R: { color: white, type: rook   },
    N: { color: white, type: knight },
    B: { color: white, type: bishop },
    Q: { color: white, type: queen  },
    K: { color: white, type: king   }
};

//#endregion combo

class Piece {
    #type           = null;
    #color          = null;
    #value          = null;
    #symbol         = null;
    #colorCode      = null;
    #hasMoved       = null;
    #inCheck        = null;
    #enPassantable  = null;
    #board          = null;
    #space          = null;
    #moves          = null;
    #pastMoves      = null;
    #notation       = null;

    // fake ones do exist
    real            = true;

    constructor(board, type, color, hasMoved, inCheck, enPassantable) {
        this.#board = board;
        this.#pastMoves = [];

        if(type) {
            if(type && !color) {
                if(comboShorthands[type]?.color) ({type: this.#type, color: this.#color} = comboShorthands[type]);
                else throw new Error('Invalid type and color passed: ' + type);
            }
            else {
                if(types[type])               this.#type = types[type];
                else if(typeShorthands[type]) this.#type = typeShorthands[type];
                else throw new Error('Invalid type passed: ' + type);

                if(colors[color])              this.#color = colors[color];
                else if(colorShortands[color]) this.#color = colorShortands[color];
                else throw new Error('Invalid color passed: ' + color);
            }

            this.#symbol            = symbols   [this.#type ];
            this.#value             = values    [this.#type ];
            this.#colorCode         = colorCodes[this.#color];

            // only passed on creation if recovering board state from LS
            this.#hasMoved          = hasMoved          || false;
            this.#inCheck           = inCheck           || false;
            this.#enPassantable     = enPassantable     || false;
            this.#notation = notations[this.#type][this.color === 'white' ? 'toUpperCase' : 'toLowerCase']();
        }
    }

    get type(         ) { return this.#type;          }
    get color(        ) { return this.#color;         }
    get value(        ) { return this.#value;         }
    get symbol(       ) { return this.#symbol;        }
    get colorCode(    ) { return this.#colorCode;     }
    get hasMoved(     ) { return this.#hasMoved;      }
    get inCheck(      ) { return this.#inCheck;       }
    get enPassantable() { return this.#enPassantable; }
    get board(        ) { return this.#board;         }
    get pastMoves(    ) { return this.#pastMoves;     }
    get space(        ) { return this.#space;         }
    get notation(     ) { return this.#notation;      }

    // budget caching go brr
    get moves() {
        if(!this.#moves) this.#moves = new Move(this).moves; 
        return this.#moves;
    }

    // no setter = never changes
    set type(type                   ) { this.#type                 = type;          return this; }
    set value(value                 ) { this.#value                = value;         return this; }
    set symbol(symbol               ) { this.#symbol               = symbol;        return this; }
    set hasMoved(hasMoved           ) { this.#hasMoved             = hasMoved;      return this; }
    set inCheck(inCheck             ) { this.#inCheck              = inCheck;       return this; }
    set enPassantable(enPassantable ) { this.#enPassantable        = enPassantable; return this; }
    set pastMoves(moves             ) { this.#pastMoves            = moves;         return this; }
    set moves(moves                 ) { this.#moves                = moves;         return this; }
    set space(space                 ) {
        this.#pastMoves.push(this.space);
        this.moves = null;
        this.#space= space;
        return this;
    }
}

export default Piece;
