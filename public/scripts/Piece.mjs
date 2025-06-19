import Move from './Move.mjs';
import { types, colors, values, symbols, notations, colorCodes, typeShorthands, colorShorthands, comboShorthands, white } from './utils.mjs';

export default class Piece {
    #type = null;
    get type() { return this.#type; }
    set type(type) { this.#type = type; }

    #color = null;
    get color() { return this.#color; }

    #value = null;
    get value() { return this.#value; }
    set value(value) { this.#value = value; }

    #symbol = null;
    get symbol() { return this.#symbol; }
    set symbol(symbol) { this.#symbol = symbol; }

    #colorCode = null;
    get colorCode() { return this.#colorCode; }

    #hasMoved = null;
    get hasMoved() { return this.#hasMoved; }
    set hasMoved(hasMoved) { this.#hasMoved = hasMoved; }

    #inCheck = null;
    get inCheck() { return this.#inCheck; }
    set inCheck(inCheck) { this.#inCheck = inCheck; }

    #board = null;
    get board() { return this.#board; }

    #space = null;
    get space() { return this.#space; }
    set space(space) {
        this.#pastMoves.push(this.#space);
        this.moves = null;
        this.#space = space;
    }

    // budget caching go brr
    #moves = null;
    set moves(moves) { this.#moves = moves; }
    get moves() {
        if (!this.#moves) this.#moves = new Move(this.main, this).moves;
        return this.#moves;
    }

    #pastMoves = null;
    get pastMoves() { return this.#pastMoves; }
    set pastMoves(moves) { this.#pastMoves = moves; }

    #notation = null;
    get notation() { return this.#notation; }

    // fake ones do exist
    get real() { return true; }

    constructor(main, board, type, color, hasMoved, inCheck) {
        this.main = main;
        this.#board = board;
        this.#pastMoves = [];

        if (type && !color) {
            if (comboShorthands[type]?.color) ({ type: this.#type, color: this.#color } = comboShorthands[type]);
            else throw new Error('Invalid type and color passed: ' + type);
        }
        else {
            if (types[type]) this.#type = types[type];
            else if (typeShorthands[type]) this.#type = typeShorthands[type];
            else throw new Error('Invalid type passed: ' + type);

            if (colors[color]) this.#color = colors[color];
            else if (colorShorthands[color]) this.#color = colorShorthands[color];
            else throw new Error('Invalid color passed: ' + color);
        }

        this.#symbol = symbols[this.#type];
        this.#value = values[this.#type];
        this.#colorCode = colorCodes[this.#color];

        // only passed on creation if recovering board state from LS
        this.#hasMoved = hasMoved || false;
        this.#inCheck = inCheck || false;
        this.#notation = notations[this.#type][this.color === white ? 'toUpperCase' : 'toLowerCase']();
    }
}
