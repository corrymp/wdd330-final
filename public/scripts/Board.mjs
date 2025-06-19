import Space from './Space.mjs';
import Piece from './Piece.mjs';
import { pawn, rook, knight, bishop, queen, king, black, white } from './utils.mjs';

/** @typedef {(number|string)} XY - board x and y coordinates */

// in FEN notation
const defaultSetup = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [, , , , , , ,],
    [, , , , , , ,],
    [, , , , , , ,],
    [, , , , , , ,],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const findChecks = (k, board) => {
    const onBoard = (x, y) => x >= 0 && y >= 0 && x < 8 && y < 8;

    const kingSpace = k.space;
    const color = k.color;

    const checks = [];
    const blocks = [];

    const _x = kingSpace.x;
    const _y = kingSpace.y;

    for (const move of [[0, 1], [1, 0], [-1, 0], [0, -1],]) {
        let block = null;
        let x = _x;
        let y = _y;
        while (onBoard(x, y)) {
            x += move[1];
            y += move[0];
            if (!onBoard(x, y)) break;
            const space = board.space(x, y);
            if (space.piece.real) {
                if (block) blocks.push(block);
                else if (space.piece.color === color) block = space;
                else if ([queen, rook].includes(space.piece.type)) checks.push(space);
            }
        }
    }

    for (const move of [[1, 1], [-1, 1], [1, -1], [-1, -1],]) {
        let block = null;
        let x = _x;
        let y = _y;
        while (onBoard(x, y)) {
            x += move[1];
            y += move[0];
            if (!onBoard(x, y)) break;
            const space = board.space(x, y);
            if(!space) break;
            if (space.piece.real) {
                if (space.piece.color !== color && block) blocks.push(block);
                else if (space.piece.color === color) block = space;
                else if ([queen, bishop].includes(space.piece.type)) checks.push(space);
            }
        }
    }

    for (const move of [[1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1]]) {
        const space = board.space(_x + move[1], _y + move[0]);
        if(!space) break;
        if (space.piece.color !== color && space.piece.type === knight) checks.push(space);
    }

    for (const move of [[1, color === white ? -1 : 1], [-1, color === white ? -1 : 1]]) {
        const space = board.space(_x + move[1], _y + move[0]);
        if(!space) break;
        if (space.piece.type === pawn && space.piece.color !== color) checks.push(space);
    }

    return { checks, blocks };
}

export default class Board {
    #startingPosition = null;
    set startingPosition(setup) { this.#startingPosition = setup; }

    #enPassantTarget = null;
    get enPassantTarget() { return this.#enPassantTarget; }
    set enPassantTarget(space) {
        if (!space) this.enPassantSubject = space;
        this.#enPassantTarget = space;
    }

    #enPassantSubject = null;
    get enPassantSubject() { return this.#enPassantSubject; }
    set enPassantSubject(space) { this.#enPassantSubject = space; }

    #selectionTarget = null;
    get selectionTarget() { return this.#selectionTarget; }
    set selectionTarget(space) { this.#selectionTarget = space; }

    #selectedSpace = null;
    get selected() { return this.#selectedSpace; }
    set selected(space) { this.#selectedSpace = space; }

    #lastSelectionTarget = null;
    get lastSelectionTarget() { return this.#lastSelectionTarget; }
    set lastSelectionTarget(space) {
        this.#lastSelectionTarget?.element.classList.remove('move');
        space.element.classList.add('move');
        this.#lastSelectionTarget = space;
    }

    #lastSelectedSpace = null;
    get lastSelected() { return this.#lastSelectedSpace; }
    set lastSelected(space) {
        this.#lastSelectedSpace?.element.classList.remove('move');
        space.element.classList.add('move');
        this.#lastSelectedSpace = space;
    }

    #boardElement = null;
    get boardEl() { return this.#boardElement; }

    #currentColor = null;
    get currentColor() { return this.#currentColor; }
    set currentColor(color) { this.#currentColor = color; }

    #boardObject = null;
    get boardObject() { return this.#boardObject; }

    #boardSpaces = null;
    get spaces() { return this.#boardSpaces; }

    #boardArray = null;
    get boardArray() { return this.#boardArray; }

    #whiteKing = null;
    #blackKing = null;
    get blackKing() { return this.#blackKing; }
    get whiteKing() { return this.#whiteKing; }

    #whiteKSRook = null;
    #whiteQSRook = null;
    #blackKSRook = null;
    #blackQSRook = null;
    get whiteKSRook() { return this.#whiteKSRook ?? { hasMoved: true }; }
    get whiteQSRook() { return this.#whiteQSRook ?? { hasMoved: true }; }
    get blackKSRook() { return this.#blackKSRook ?? { hasMoved: true }; }
    get blackQSRook() { return this.#blackQSRook ?? { hasMoved: true }; }

    #pastMoves = null;
    get pastMoves() { return this.#pastMoves; }
    get pastMove() { return this.#pastMoves[this.#pastMoves.length - 1]; }
    set pastMoves(moves) { this.#pastMoves = moves; }
    set pastMove(move) { this.#pastMoves.push(move); }

    #lastMove = null;
    get lastMove() { return this.#lastMove; }
    set lastMove(move) { this.#lastMove = move; }

    #targets = [];
    get targets() { return this.#targets; }
    set targets(spaces) { this.#targets = spaces; }

    #checks = [];
    get checks() { return this.#checks; }
    set checks(spaces) { this.#checks = spaces; }

    #blocks = [];
    get blocks() { return this.#blocks; }
    set blocks(spaces) { this.#blocks = spaces; }

    #game = null;
    get game() { return this.#game; }

    #height = 8;
    #width = 8;

    get refreshMoves() { return this.getRefreshedMoves([]); }

    constructor(main, game, boardEl, setup) {
        this.main = main;
        this.#game = game;
        this.#boardElement = boardEl;
        this.#startingPosition = setup ?? defaultSetup;
    }

    /*
        //const t = this.#boardElement.appendChild(document.createElement('table'));const colgroup = t.appendChild(document.createElement('colgroup'));colgroup.appendChild(document.createElement('col'));const thead = t.appendChild(document.createElement('thead'));const theadtr = thead.appendChild(document.createElement('tr'));theadtr.appendChild(document.createElement('td'));const tbody = t.appendChild(document.createElement('tbody'));const tfoot = t.appendChild(document.createElement('tfoot'));const tfoottr = tfoot.appendChild(document.createElement('tr'));tfoottr.appendChild(document.createElement('td'));
        //const fileNum = Math.abs(x-7);const col = colgroup.appendChild(document.createElement('col'));col.classList.add('file');col.dataset.file = files[fileNum];col.dataset.x = fileNum;const theadth = theadtr.appendChild(document.createElement('th'));theadth.dataset.file = files[fileNum];theadth.dataset.x = fileNum;theadth.textContent = files[fileNum];const tfootth = tfoottr.appendChild(document.createElement('th'));tfootth.dataset.file = files[fileNum];tfootth.dataset.x = fileNum;tfootth.textContent = fileNum;const tr = tbody.appendChild(document.createElement('tr'));tr.classList.add('rank');tr.dataset.rank = x + 1;tr.dataset.y = fileNum;const th = tr.appendChild(document.createElement('th'));th.dataset.rank = x + 1;th.dataset.x = fileNum;th.textContent = x + 1;
        //const btn = tr.appendChild(document.createElement('td')).appendChild(document.createElement('button'));btn.type = 'button';btn.classList.add('space');btn.dataset.fr = ranks[y] + files[x];btn.dataset.file = files[x];btn.dataset.rank = ranks[y];btn.dataset.x = x;btn.dataset.y = y;
        //const otherTh = tr.appendChild(document.createElement('th'));otherTh.dataset.rank = x + 1;otherTh.dataset.y = fileNum;otherTh.textContent = fileNum;
        //colgroup.appendChild(document.createElement('col'));theadtr.appendChild(document.createElement('td'));tfoottr.appendChild(document.createElement('td'));
    */

    /** @description initilizes the board object */
    setupBoard(castlingRights, enPassantTarget) {
        const files = 'abcdefgh'; // x
        const ranks = '87654321'; // y

        const spaceElements = this.#boardElement.querySelectorAll('.space');

        // array of 8 arrays of 8 nulls
        this.#boardArray = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.#boardObject = {};
        this.#boardSpaces = Array(64);

        for (let x = 0; x < this.#height; x++) {
            for (let y = 0; y < this.#width; y++) {
                const index = y + (x * 8);

                // if the value of the object at key file/rank is empty, set it to an empty object
                if (!this.#boardObject[files[y]]) this.#boardObject[files[y]] = {};
                if (!this.#boardObject[ranks[x]]) this.#boardObject[ranks[x]] = {};

                const spaceEl = spaceElements[index];
                const space = new Space(this.main, this, y, x, spaceEl);

                // access board either through all numbers, (letter,number), or (number,letter)
                this.#boardSpaces[index] = space; // 0,1,2...63
                this.#boardArray[x][y] = space; // (0,0),(0,1),(0,2)...(7,7)
                this.#boardObject[ranks[x]][files[y]] = space; // a1,a2,a3...h8
                this.#boardObject[files[y]][ranks[x]] = space; // 1a,1b,1c...8h

                // sets the piece if the space has a piece in the starting positions
                if (this.#startingPosition[x][y]) {
                    space.piece = new Piece(this.main, this, this.#startingPosition[x][y]);
                    if (this.#startingPosition[x][y] !== defaultSetup[x][y]) space.piece.hasMoved = true;
                }

                // saves the piece for future ref if the piece is a king
                if (space.piece.type === king) space.piece.color === white
                    ? this.#whiteKing = space.piece
                    : this.#blackKing = space.piece;

                else if (space.piece.type === rook) space.piece.color === white
                    ? space.x === 0 ? this.#whiteQSRook = space.piece : this.#whiteKSRook = space.piece
                    : space.x === 0 ? this.#blackQSRook = space.piece : this.#blackKSRook = space.piece;
            }
        }

        if (castlingRights) {
            if (this.whiteKSRook && !castlingRights.includes('K')) this.whiteKSRook.hasMoved = true;
            if (this.whiteQSRook && !castlingRights.includes('Q')) this.whiteQSRook.hasMoved = true;
            if (this.blackKSRook && !castlingRights.includes('k')) this.blackKSRook.hasMoved = true;
            if (this.blackQSRook && !castlingRights.includes('q')) this.blackQSRook.hasMoved = true;
        }

        if (enPassantTarget) this.enPassantTarget = this.space(...enPassantTarget.split(''));

        this.getRefreshedMoves();
    }

    /**
     * @param {XY} _x - One of either: board X coordinate, board index, board rank, board file
     * @param {XY} _y - One of either: board Y coorinate, board rank, board file
     * @param {boolean} log - Whether to log extra information to the console
     * @returns {Space|null} The space coresponding to the given parameters; null if invalid
     */
    space(_x, _y, log) {
        const files = 'abcdefgh'.split('');
        const isOffBoardXY = (x, y) => y < 0 || x < 0 || y > 7 || x > 7;
        const isOffBoardRF = (r, f) => r < 1 || r > 8 || !files.includes(f);
        const isOffBoardIndex = i => i < 0 || i > 63;

        const x = isNaN(_x * 1) ? _x : _x * 1;
        const y = isNaN(_y * 1) ? _y : _y * 1;

        // just a number = raw index
        if (typeof x === 'number' && y === undefined) {
            if (log) console.log('raw index:', x, y);
            if (isOffBoardIndex(x)) return null;
            return this.#boardSpaces[x];
        }

        // (number,string) = (rank,file)
        if (typeof x === 'number' && typeof y === 'string') {
            if (log) console.log(`Rank: ${x}; File: ${y};`, '(', x, ',', y, ')');
            if (isOffBoardRF(y, x)) return null;
            return this.#boardObject[y][x];
        }

        // (string,number) = (file,rank)
        if (typeof x === 'string' && typeof y === 'number') {
            if (log) console.log(`File: ${x}; Rank: ${y};`, '(', x, ',', y, ')');
            if (isOffBoardRF(y, x)) return null;
            return this.#boardObject[x][y];
        }

        // (number,number) = (x,y)
        if (typeof x === 'number' && typeof y === 'number') {
            if (log) console.log(`X: ${x}; Y: ${y};`, '(', x, ',', y, ')');
            if (isOffBoardXY(x, y)) return null;
            return this.#boardArray[y][x];
        }

        if (log) console.log(`Invalid space notation: ${x}, ${y}`, '(', x, ',', y, ')');
        return null;
    }

    /**
     * @param {Space} space - space to "click"; clicks can be fully programatic
     * @returns 
     */
    clickSpace(space) {

        // clear all past move markers
        this.clearValid();

        // if a space was already clicked...
        if (this.selected) {

            // set the selection target for ease of reference
            this.selectionTarget = space;

            // I just don't want to type "this." every time :shrug:
            const selected = this.selected;

            // unclick the space if it is the already clicked space
            if (selected === space) return this.unselect();

            // change the selection to the new space if the piece colors match between clicked spaces
            else if (space.piece.color === selected?.piece?.color) this.select(space);

            // if the clicked space is in the list of possible moves...
            else if (
                selected.piece.moves.map(m => m.join('')).includes(space.xy.join('')) ||
                // I trust Stockfish not to cheat
                this.#game.turn === this.#game.stockfishPlayer
            ) {

                // make the move
                this.makeMove(space);

                // clear the selection
                this.unselect();
            }
            else this.unselect();
        }

        // do nothing if the clicked space is empty
        else if (!space.piece.real) return;

        // select the space if there are no prior selections
        else if (!this.selected) this.select(space);
    }

    /** @description Clears all marker class from all spaces */
    clearValid = () => this.#boardSpaces.forEach(space => (
        space.element.classList.remove('validMove'),
        space.element.classList.remove('selected')
    ));

    /** @param {Space} space - space to select */
    select(space) {
        this.selected = space;
        space.element.classList.add('selected');
        this.showMoves(space.piece);
    }

    /** @description Unselects the selected space and target */
    unselect() {
        this.selected.element.classList.remove('selected');
        this.selected = null;
        this.selectionTarget = null
    }

    getRefreshedMoves(list) {
        const k = this.game.turn ? this.blackKing : this.whiteKing

        const checkRes = findChecks(k, this);
        this.checks = checkRes.checks;
        this.blocks = checkRes.blocks;

        if(this.checks.length) k.inCheck = true;
        else k.inCheck = false;

        // go over every space on the board...
        this.spaces.forEach(space => {

            // clear cached moves
            space.piece.moves = null;

            // add the pieces moves to the list if the space has a piece and the piece is the color from before
            if (space.piece.real && space.piece.color !== this.currentColor) {
                const moves = space.piece.moves;
                if (list) list.push(...moves);
            }
        });

        return list;
    }

    /** @param {Piece} piece - The piece to highlight moves for if any */
    showMoves(piece) {

        // proceed with all the potential moves if piece is real (IE, not an empty space)
        if (piece.real) for (const move of piece.moves) {
            const space = this.space(move[1], move[0]);

            // ignores "spaces" that are outside the board
            if (!space) continue;

            // ignore the potential move if the target piece is the same color
            if (space.piece.color === piece.color) continue;

            //if(piece.type === king && space.attackers) continue;

            // mark spaces as valid for display
            space.element.classList.add('validMove');
        }
    }

    makeMove(space) {
        const from = this.selected;
        const to = space;

        this.lastSelected = from;
        this.lastSelectionTarget = to;

        // reset enPassantable target as it is no longer a valid target
        if (from.piece.type !== pawn || to !== this.enPassantTarget) this.enPassantTarget = null;

        // updates the halfmove clock or reset if a piece was captured or a pawn was moved
        to.piece.real || from.piece.type === pawn ? this.#game.halfMoveClock = 0 : this.#game.halfMoveClock++;

        if (to.piece.type === king) return alert(`The game is over with a ${from.piece.color} victory`);

        // pawn logic
        if (from.piece.type === pawn) {

            // update the enPassant target if the pawn had not moved &&
            // the departing row is 1 or 6 &&
            // the target row is 3 or 4 respectively
            if (
                !from.piece.hasMoved &&
                (from.y === 1 && to.y === 3) ||
                (from.y === 6 && to.y === 4)
            ) {
                const potentialEpTarg = this.space(to.x, to.y === 3 ? 2 : 5);

                [1, -1].map(xOffset => {
                    const ep = this.space(to.x + xOffset, to.y)
                    if (
                        !ep ||
                        !ep.piece ||
                        ep.piece.type !== pawn ||
                        ep.piece.color === from.piece.color
                    ) return;

                    this.enPassantTarget = potentialEpTarg;
                    this.enPassantSubject = to;
                });
            }

            // capture the piece in the space behind the target space if en passant
            if (to === this.enPassantTarget) this.enPassantSubject.piece = null;

            // if the target row is the first or last on the board...
            if (to.y === 0 || to.y === 7) {
                console.log('promotion incoming');
                this.promote(from.piece, from);
            }
        }

        // king logic
        else if (from.piece.type === king) {

            // castling
            if (Math.abs(from.x - to.x) > 1) {
                const rook = this.space(to.x === 6 ? 7 : 0, to.y);
                this.space(to.x === 6 ? 5 : 3, to.y).piece = rook.piece;
                rook.piece.hasMoved = true;
                rook.piece = null;
            }
        }

        this.#game.updateHistory();

        // Clears it AFTER the history is updated, as it's harder to detect otherwise
        if (to === this.enPassantTarget) this.enPassantTarget = null;

        // replace target piece with moved piece
        to.piece = from.piece;

        // mark piece as having moved
        to.piece.hasMoved = true;

        // clear old piece from the board
        from.piece = null;

        // run post-move mechanics
        this.madeMove();
    }

    madeMove() {
        // updates the history

        // get the color of the pieces that just moved (it's a surprise tool that will help us later)
        this.currentColor = this.#game.turn ? white : black;

        // proceed with the next turn
        this.#game.nextTurn();

        // list of all spaces that are being attacked
        const allMoves = this.refreshMoves;

        const targetedSpaces = new Set;

        // with each of those moves...
        allMoves.forEach(move => {

            // find the mathcing space
            const space = this.space(move[1], move[0]);
            targetedSpaces.add(space);

            // put the contained piece in check if the piece is a king of the proper color
            if (space.piece.real && space.piece.type === king && space.piece.color === this.currentColor) space.piece.inCheck = true;
            if (space.piece.inCheck) console.log('in check', move, space);
        });

        this.targets = Array.from(targetedSpaces);
    }

    promote(piece, space) {
        let promotion;

        while (![knight, bishop, rook, queen].includes(promotion)) {
            promotion = prompt(`Enter one of 'knight','bishop','rook', or 'queen' to promote to.`, queen);

            if (promotion) promotion = promotion.toLowerCase();
        }

        console.log(`promoting to ${promotion}`);

        space.piece = new Piece(this.main, this, promotion, piece.color, piece.hasMoved, piece.inCheck, piece.enPassantable);
    }
};
