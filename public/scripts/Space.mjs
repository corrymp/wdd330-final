const yToRank = {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 0
};

const rankToY = {
    0: 8,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
    8: 7
};

const xToFile = {
    0: 'h',
    1: 'g',
    2: 'f',
    3: 'e',
    4: 'd',
    5: 'c',
    6: 'b',
    7: 'a',
    8: 'h'
};

const fileToX = {
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
    #rank = false;
    #file = false;
    #x = false;
    #y = false;
    #piece = null;

    constructor(rank, file, piece) {
        this.#rank = rank;
        this.#file = file;
        this.#piece = piece ?? null;
    }
    
    get x() { return this.#x }
    set x(x) { this.#x = x; return this; }

    get y() { return this.#y }
    set y(y) { this.#y = y; return this; }

    get rank() { return this.#rank }
    set rank(rank) { this.#rank = rank; return this; }

    get file() { return this.#file }
    set file(file) { this.#file = file; return this; }

    get piece() { return this.#piece }
    set piece(piece) { this.#piece = piece; return this; }
};

export default Space;
