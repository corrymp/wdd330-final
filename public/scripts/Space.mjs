import { xyToIndex, yToRank, xToFile } from './utils.mjs';

export default class Space {
    #rank = null;
    #file = null;
    get rank() {  return this.#rank }
    get file() {  return this.#file }

    #x = null;
    #y = null;
    get x() {  return this.#x }
    get y() {  return this.#y }
    get xy() {  return [this.#y, this.#x] }

    #index = null;
    get index() { return this.#index;}

    #element = null;
    get element() {  return this.#element }

    #board = null;
    get board() { return this.#board;}

    // "dummy" piece with useful base properties (board, space, real) returned if the space is empty
    #noPiece = {
        type: false,
        color: false,
        value: false,
        symbol: false,
        colorCode: false,
        hasMoved: false,
        inCheck: false,
        board: false,
        space: false,
        moves: [],
        pastMoves: [],
        notation: '',
        real: false,
    }

    #piece = null;
    get piece() {  return this.#piece ? this.#piece : this.#noPiece; }

    get isEmpty() { return !this.piece.real;}

    // updates the piece internally along with the visuals
    set piece(piece) {
        this.#piece = piece;
        piece ? piece.space = this : void 0;
        this.#element.dataset.symbol = piece ? piece.symbol : '';
        this.#element.dataset.color = piece ? piece.color : '';
        const title = `rank ${this.file}, file ${this.rank}: ${piece ? `${piece.color} ${piece.type}` : 'vacant'}`;
        this.#element.ariaLabel = `chess board square: ${title}.`;
        this.#element.title = title;
    }

    constructor(main, board, x, y, el) {
        this.main = main;
        this.#board = board;

        this.#y = y;
        this.#x = x;
        this.#file = xToFile[x];
        this.#rank = yToRank[y];
        this.#index = xyToIndex(x,y);

        this.#element = el;

        this.#noPiece.board = board;
        this.#noPiece.space = this;

        this.piece = null;

        this.#element.addEventListener('click', this.click.bind(this));
    }

    // clicks can be fully through code (such as from an API response)
    click = () => this.#board.clickSpace(this);
};
