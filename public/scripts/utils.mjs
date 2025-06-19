//#region general utility
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const afterSleep = async (ms, fn, ...args) => fn(...args, await sleep(ms));
//#endregion general utility


//#region board space access
export const xyToIndex = (x, y)=> x + (y * 8);

export const yToRank = {
    0: 8,
    1: 7,
    2: 6,
    3: 5,
    4: 4,
    5: 3,
    6: 2,
    7: 1
};

export const fileToX = {
    8: 0,
    7: 1,
    6: 2,
    5: 3,
    4: 4,
    3: 5,
    2: 6,
    1: 7
};

export const xToFile = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd',
    4: 'e',
    5: 'f',
    6: 'g',
    7: 'h'
};

export const rankToY = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7
};
//#endregion board space access


//#region piece attributes
//#region piece types
export const pawn = 'pawn';
export const rook = 'rook';
export const knight = 'knight';
export const bishop = 'bishop';
export const queen = 'queen';
export const king = 'king';
//#endregion type types


//#region piece symbols
export const pawnSymbol = '♙';
export const rookSymbol = '♖';
export const knightSymbol = '♘';
export const bishopSymbol = '♗';
export const queenSymbol = '♕';
export const kingSymbol = '♔';
//#endregion piece symbols


//#region piece values
export const pawnValue = 1;
export const rookValue = 5;
export const knightValue = 3;
export const bishopValue = 3;
export const queenValue = 9;
export const kingValue = Infinity;
//#endregion values


//#region piece notations
export const pawnNotation = 'p';
export const rookNotation = 'r';
export const knightNotation = 'n';
export const bishopNotation = 'b';
export const queenNotation = 'q';
export const kingNotation = 'k';
//#endregion type notations


//#region piece collections
export const types = {
    pawn,
    rook,
    knight,
    bishop,
    queen,
    king
};

export const typeShorthands = {
    p: pawn,
    r: rook,
    n: knight,
    b: bishop,
    q: queen,
    k: king
};

export const symbols = {
    pawn: pawnSymbol,
    rook: rookSymbol,
    knight: knightSymbol,
    bishop: bishopSymbol,
    queen: queenSymbol,
    king: kingSymbol
};

export const notations = {
    pawn: pawnNotation,
    rook: rookNotation,
    knight: knightNotation,
    bishop: bishopNotation,
    queen: queenNotation,
    king: kingNotation
}

export const values = {
    pawn: pawnValue,
    rook: rookValue,
    knight: knightValue,
    bishop: bishopValue,
    queen: queenValue,
    king: kingValue
}
//#endregion piece collections


//#region piece colors
export const white = 'white';
export const black = 'black'

export const whiteColor = 'var(--off-white)';
export const blackColor = 'var(--off-black)'

export const colors = { 
    white, 
    black 
};

export const colorShorthands = {
    w: white,
    b: black
};

export const colorCodes = {
    white: whiteColor,
    black: blackColor
}
//#endregion piece colors

export const comboShorthands = {
    p: { color: black, type: pawn },
    r: { color: black, type: rook },
    n: { color: black, type: knight },
    b: { color: black, type: bishop },
    q: { color: black, type: queen },
    k: { color: black, type: king },

    P: { color: white, type: pawn },
    R: { color: white, type: rook },
    N: { color: white, type: knight },
    B: { color: white, type: bishop },
    Q: { color: white, type: queen },
    K: { color: white, type: king }
};
//#endregion piece attributes

