import Space from './Space.mjs';
import Piece from './Piece.mjs';

// in FEN notation
const defaultSetup = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [, , , , , , , , ,],
    [, , , , , , , , ,],
    [, , , , , , , , ,],
    [, , , , , , , , ,],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const setupBoardObject = (setup) => {
    const _setup = setup ?? defaultSetup;
    let board = [];
    for (let y = 0; y < 8; y++) {
        const row = [];
        for (let x = 0; x < 8; x++) row.push(new Space(y, x, new Piece(_setup[x][y] ?? false)));
        board.push(row);
    }
    return board;
};

const setupSpaces = (boardEl, board) => {
    const elementsBoard = [[], [], [], [], [], [], [], []];
    for (const space of boardEl.querySelectorAll('.space')) {
        const rank = space.dataset.rank;
        const file = space.dataset.file;
        const x = space.dataset.x * 1;
        const y = space.dataset.y * 1;
        console.assert(space.dataset.space === `${space.dataset.file}${space.dataset.rank}` && `${space.dataset.file}${space.dataset.rank}` === `${file}${rank}`);
        const objSpace = board[x][y];
        objSpace.element = space;
        elementsBoard[y][x] = space;
        space.piece = objSpace;
        space.dataset.symbol = objSpace.piece.symbol ?? '';
        space.dataset.color = objSpace.piece.color;
    };
    return elementsBoard;
};

class Board {
    #startingPosition = null;
    #enPassantTarget = null;
    #selectionTarget = null;
    #selectedSpace = null;
    #boardElement = null;
    #currentColor = null;
    #boardObject = null;
    #boardSpaces = null;
    #boardArray = null;
    #whiteKing = null;
    #blackKing = null;
    #pastMoves = null;
    #lastMove = null;
    #targets = [];
    #game = null;
    #height = 8;
    #width = 8;

    constructor(game, boardEl, setup) {
        this.#game = game;
        this.#boardElement = boardEl;
        this.#startingPosition = setup ?? defaultSetup;
    }

    setupBoard() {
        const files = 'abcdefgh'; // x
        const ranks = '87654321'; // y

        const spaceElements = this.#boardElement.querySelectorAll('.space');

        // array of 8 arrays of 8 nulls
        this.#boardArray = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.#boardObject = {};
        this.#boardSpaces = [];

        for (let x = this.#height; x--;) {
            for (let y = this.#width; y--;) {
                const index = y + (x * 8);

                if (!this.#boardObject[files[x]]) this.#boardObject[files[x]] = {};
                if (!this.#boardObject[ranks[y]]) this.#boardObject[ranks[y]] = {};

                const spaceEl = spaceElements[index];

                const space = new Space(this, y, x, spaceEl);

                // access board either through all numbers, (letter,number), or (number,letter)
                this.#boardSpaces[index] = space; // 0,1,2...63
                this.#boardArray[x][y] = space; // (0,0),(0,1),(0,2)...(7,7)
                this.#boardObject[ranks[y]][files[x]] = space; // a1,a2,a3...h8
                this.#boardObject[files[x]][ranks[y]] = space; // 1a,1b,1c...8h

                if (this.#startingPosition[x][y]) space.piece = new Piece(this, this.#startingPosition[x][y]);

                // saves the piece for future ref if the piece is a king
                if(space.piece.type === 'king') space.piece.color === 'white' 
                        ? this.#whiteKing = space.piece 
                        : this.#blackKing = space.piece;
            }
        }
        this.getRefreshedMoves();
    }

    clearValid = () => this.#boardSpaces.forEach(space => (
        space.element.classList.remove('validMove'),
        space.element.classList.remove('visited'),
        space.element.classList.remove('selected')
    ));

    // different representations of the board
    get boardArray() { return this.#boardArray; }
    get boardObject() { return this.#boardObject; }
    get spaces() { return this.#boardSpaces; }

    // kings for easy refference
    get blackKing() {return this.#blackKing;}
    get whiteKing() {return this.#whiteKing;}

    get currentColor() {return this.#currentColor;}
    set currentColor(color) {this.#currentColor = color; return this;}

    // currently selected space for easy refference
    get selected() { return this.#selectedSpace; }
    set selected(space) { this.#selectedSpace = space; return this; }

    // currently targeted space for easy refference
    get selectionTarget() { return this.#selectionTarget; }
    set selectionTarget(space) { this.#selectionTarget = space; return this; }

    // all spaces currently targeted
    get targets() {return this.#targets;}
    set targets(spaces) {this.#targets = spaces; return this;}

    // 
    get enPassantTarget() {return this.#enPassantTarget;}
    set enPassantTarget(piece) {this.#enPassantTarget = piece; return this;}

    get lastMove() {return this.#lastMove;}
    set lastMove(move) {this.#lastMove = move; return this;}
    
    get pastMoves() {return this.#pastMoves;}
    get pastMove() {return this.#pastMoves[this.#pastMoves.length - 1];}

    set pastMoves(move) {this.#pastMoves = move; return this;}
    set pastMove(move) {this.#pastMoves.push(move); return this;}

    space(y, x) {
        // just a number = raw index
        if (typeof y === 'number' && x === undefined) {
            // console.log('raw index:', y, x)
            if (y < 0 || y > 63) return null;
            return this.#boardSpaces[y];
        }
        // (number,string) = (file,rank)
        if (typeof y === 'number' && typeof x === 'string') {
            // console.log('file,rank:', y, x)
            if (y < 1 || y > 8 || !'abcdefgh'.split('').includes(x)) return null;
            return this.#boardObject[x][y];
        }
        // (string,number) = (rank,file)
        if (typeof y === 'string' && typeof x === 'number') {
            // console.log('rank,file:', y, x)
            if (x < 1 || x > 8 || !'abcdefgh'.split('').includes(y)) return null;
            return this.#boardObject[y][x];
        }
        // (number,number) = (y,x)
        if (typeof y === 'number' && typeof x === 'number') {
            // console.log('number,number:', y, x)
            if (x < 0 || y < 0 || x > 7 || y > 7) return null;
            return this.#boardArray[y][x];
        }
        return null;
    }

    makeMove(space) {
        const from = this.selected;
        const to = space;

        // updates the halfmove clock or reset if a piece was captured or a pawn was moved
        if(to.piece.real || from.piece.type === 'pawn') this.#game.halfMoveClock = 0;
        else this.#game.halfMoveClock++;

        if(to.piece.type === 'king') return alert(`The game is over with a ${from.piece.color} victory`);

        // pawn logic
        if (from.piece.type === 'pawn') {

            // mark the pawn an enPassantable if it had not moved 
            // & the departing row is 1 or 6 
            // & the target row is 3 or 4 respectively
            if (!from.piece.hasMoved && (from.x === 1 && to.x === 3) || (from.x === 6 && to.x === 4)) {

                // marks piece as enPassantable
                from.piece.enPassantable = true;

                // marks the enPassantable space
                this.enPassantTarget = this.space(to.x === 3 ? 2 : 5, to.y);
            }

            // otherwise unmark the pawn if it is marked as enPassantable
            else if (from.piece.enPassantable) {

                // 
                from.piece.enPassantable = false;

                // 
                this.enPassantTarget = null;
            }

            // if the departing column is not the same as the target column and the target space is empty...
            if (from.y !== to.y && !to.piece.real) {

                // get the space behind the target space
                // delete the piece in that space
                this.space(to.y, from.x).piece = null;

                // celebrate
                console.log('E N  P A S S A N T');
            }

            // if the target row is the first or last on the board...
            if (to.x === 0 || to.x === 7) {
                // WIP
                console.log('promotion incoming');
                this.promote(from.piece, from);
            }
        }

        // king logic
        else if (from.piece.type === 'king') {

            // castling
            if(Math.abs(from.y - to.y) > 1) {
                let rook = this.space(to.y === 6 ? 7 : 0, from.x);
                this.space(to.y === 6 ? 5 : 3, from.x).piece = rook.piece;
                rook.piece = null;
            }
        }

        

        // replace target piece with moved piece
        to.piece = from.piece;

        // mark piece as having moved
        to.piece.hasMoved = true;
        this.#game.updateHistory();

        // clear old piece from the board
        from.piece = null;

        // run post-move mechanics
        this.madeMove();
    }

    get refreshMoves() { return this.getRefreshedMoves([]); }

    getRefreshedMoves(list) {
        // go over every space on the board...
        this.spaces.forEach(space => {

            // clear cached moves
            space.piece.moves = null;

            // add the pieces moves to the list if the space has a piece and the piece is the color from before
            if (space.piece.real && space.piece.color !== this.currentColor) {
                const moves = space.piece.moves

                if(list) list.push(...moves);
            }
        });

        return list;
    }

    madeMove() {
        // updates the history

        // get the color of the pieces that just moved (it's a surprise tool that will help us later)
        this.currentColor = this.#game.turn ? 'white' : 'black';

        // proceed with the next turn
        this.#game.nextTurn();

        // list of all spaces that are being attacked
        const allMoves = this.refreshMoves;
        
        const targetedSpaces = [];

        // with each of those moves...
        allMoves.forEach(move => {

            // find the mathcing space
            const space = this.space(move[1], move[0]);
            targetedSpaces.push(space);

            // put the contained piece in check if the piece is a king of the proper color
            if (space.piece.real && space.piece.type === 'king' && space.piece.color === this.currentColor) space.piece.inCheck = true;
            if (space.piece.inCheck) console.log('in check', move, space);
        });

        this.targets = targetedSpaces;
    }

    promote(piece, space) {
        let promotion;

        while (!['knight', 'bishop', 'rook', 'queen'].includes(promotion)) {
            promotion = prompt(`Enter one of 'knight','bishop','rook', or 'queen' to promote to.`, 'queen');

            if (promotion) promotion = promotion.toLowerCase();
        }

        console.log(`promoting to ${promotion}`);

        space.piece = new Piece(this, promotion, piece.color, piece.hasMoved, piece.inCheck, piece.enPassantable);

    }

    showMoves(piece) {
        // proceed with all the potential moves if piece is real (IE, not an empty space)
        if (piece.real) for (const move of piece.moves) {
            const space = this.space(move[1], move[0]);

            // ignores "spaces" that are outside the board
            if (!space) continue;

            // ignore the potential move if the target piece is the same color
            if (space.piece.color === piece.color) continue;

            // mark spaces as valid for display
            space.element.classList.add('validMove');
        }
    }

    select(space) {
        this.selected = space;
        space.element.classList.add('selected');
        this.showMoves(space.piece);
    }

    unselect() {
        this.selected.element.classList.remove('selected');
        this.selected = null;
        this.selectionTarget = null
    }

    clickSpace(space) {
        // clear all past move markers
        this.clearValid();

        // if a space was already clicked...
        if (this.selected) {
            this.selectionTarget = space;

            const selected = this.selected;

            // unclick the space if it is the already clicked space
            if (selected === space) return this.unselect();

            // change the selection to the new space if the piece colors match between clicked spaces
            else if (space.piece.color === selected?.piece?.color) this.select(space);

            // if the clicked space is in the list of possible moves...
            else if (selected.piece.moves.map(m => m.join('')).includes(space.xy.join(''))) {

                // make the move
                this.makeMove(space);

                // clear the selection
                this.unselect();
            }
        }

        // do nothing if the clicked space is empty
        else if (!space.piece.real) return;

        // select the space if there are no prior selections
        else if (!this.selected) this.select(space);
    }
};

export default Board;
