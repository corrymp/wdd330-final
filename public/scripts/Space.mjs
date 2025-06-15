const xToRank = {
    0: 8,
    1: 7,
    2: 6,
    3: 5,
    4: 4,
    5: 3,
    6: 2,
    7: 1
};

const rankToX = {
    8: 0,
    7: 1,
    6: 2,
    5: 3,
    4: 4,
    3: 5,
    2: 6,
    1: 7
};

const yToFile = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd',
    4: 'e',
    5: 'f',
    6: 'g',
    7: 'h'
};

const fileToY = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7
};

class Space {
    #rank       = false;
    #file       = false;
    #x          = false;
    #y          = false;
    #piece      = null;
    #element    = null;
    #board      = null;

    // version of a piece with useful base properties (board, space, real)
    #noPiece = {
        type:           false,
        color:          false,
        value:          false,
        symbol:         false,
        colorCode:      false,
        hasMoved:       false,
        inCheck:        false,
        enPassantable:  false,
        board:          false,
        space:          false,
        moves:          [],
        pastMoves:      [],
        notation:       '',
        real:           false,
    }

    constructor(board, y, x, el) {
        this.#board   = board;
        this.#y       = y;
        this.#x       = x;
        this.#rank    = xToRank[x];
        this.#file    = yToFile[y];
        this.#element = el;

        this.#noPiece.board = board;
        this.#noPiece.space = this;

        this.#element.addEventListener('click', this.click.bind(this));
    }
    
    // spaces don't move, so neither does their notation
    get x(      ) { return this.#x       }
    get y(      ) { return this.#y       }
    get rank(   ) { return this.#rank    }
    get file(   ) { return this.#file    }
    get element() { return this.#element }
    get xy(     ) { return [this.#y,this.#x]}

    // returns a "dummy" piece if the space is empty
    get piece() {
        if(this.#piece) return this.#piece;
        return this.#noPiece; 
    }

    // updates the piece internally along with the visuals
    set piece(piece) {
        this.#piece = piece;

        if(piece) {
            this.#element.dataset.symbol = piece.symbol;
            this.#element.dataset.color = piece.color;
           // piece.moves = null;
            piece.space = this;
        }
        else {
            this.#element.dataset.symbol = '';
            this.#element.dataset.color = '';
        }

        return this; 
    }

    click(e) {
        this.#board.clickSpace(this);
    }
};

export default Space;
