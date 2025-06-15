//#region move templates
const diagonals = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
];

const cross = [
    [0, 1],
    [1, 0],
    [-1, 0],
    [0, -1],
];

const square = [...diagonals, ...cross];

const knight = [[1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1]];

const kingInCheck = {
    black: [...square, ...knight, [0,-1]],
    white: [...square, ...knight, [0, 1]]
};

const moveTypes = {
    king: square,
    queen: square,
    rook: cross,
    bishop: diagonals,
    knight,
    pawn: [[0, 1]],
    pawnFirstMove: [[0, 2]],
    kingKingsideCastle: [[2, 0]],
    kingQueensideCastle: [[-2, 0]],
    rookKingsideCastle: [[-2, 0]],
    rookQueensideCastle: [[3, 0]]
}
//#endregion move templates

class Move {
    #piece = null;
    #moves = null;

    constructor(piece) { this.#piece = piece; }

    refreshMoves() {
        // this will hold all the valid moves as they are determined
        const validMoves = [];

        // gets the base move template for the given piece
        let baseMoves = moveTypes[this.#piece.type];

        // inverts the moveset for white pawns
        if (this.#piece.type === 'pawn' && this.#piece.color === 'white') baseMoves = baseMoves.map(move => move.map(i => -i));

        else if (this.#piece.type === 'king' && !this.#piece.hasMoved && !this.#piece.inCheck) {

            // gets the rank
            const rank = this.#piece.space.rank;

            // gets all the spaces involved in both types of castles
            const [a,b,c,d,e,f,g,h] = 'abcdefgh'.split('').map(l=>this.#piece.board.space(l, rank).piece);

            // empty f file, g file, unmoved rook in h file, f and g files unattacked
            if (
                !f.real && !this.#piece.board.targets.includes(f) &&
                !g.real && !this.#piece.board.targets.includes(g) &&
                h.real && !this.#piece.board.targets.includes(e) && h.type === 'rook' && !h?.hasMoved
            ) baseMoves.push(...moveTypes.kingKingsideCastle);

            // empty d file, c file, b file, unmoved room in a file, d and c files unattacked
            if (
                !d.real && !this.#piece.board.targets.includes(d) &&
                !c.real && !this.#piece.board.targets.includes(c) &&
                !b.real && !this.#piece.board.targets.includes(e) &&
                a.real && a.type === 'rook' && !a?.hasMoved
            ) baseMoves.push(...moveTypes.kingQueensideCastle);
        }

        baseMoves.forEach(move => {
            // xy coords for the origin space
            let x = this.#piece.space.x;
            let y = this.#piece.space.y;

            // infinite movement pieces
            // if you add 'knight' to this list, the game gets 20% cooler
            if (['queen', 'rook', 'bishop'].includes(this.#piece.type)) {

                // traces each space accesible to the given piece
                while (x >= 0 && y >= 0 && x < 8 && y < 8) {

                    // increases the xy coords in the given direction examples:
                    // x:1, y:1, move:[ 0,1] => x:1, y:2
                    // x:4, y:2, move:[-1,2] => x:3, y:4
                    x = x + move[1];
                    y = y + move[0];

                    // stops the trace if x or y leave the board (may un-hardcode board size?)
                    if (x < 0 || x > 7 || y < 0 || y > 7) break;

                    // gets the space at the given coordinates
                    const targ = this.#piece.board.space(x, y);

                    // stops the trace if there is no space (should never happen, but you never know)
                    if (!targ) break;

                    // if the targeted piece is not the same color as the attacking piece...
                    if (targ.piece?.color !== this.#piece.color) {

                        // mark it as visited
                        targ?.element?.classList?.add('visited');

                        // add the coords to the list of valid moves
                        validMoves.push(targ.xy);
                    }

                    // end the trace if the givin space contains a piece
                    if (targ.piece.real) break;
                }
            }

            // everything else
            else {
                // offset the space coords based on the move
                x += move[1];
                y += move[0];

                // get thr targeted space
                const targ = this.#piece.board.space(x, y);

                // handle pawn logic
                if (this.#piece.type === 'pawn') {

                    // normal pawn capture mechanics + e n  p a s s a n t
                    // does everything twice: once in the positive direction, once in the negetive
                    [1,-1].forEach(
                        v => {

                            // get potential capture space: same x, offset y by one(+-)
                            const pawnCapt = this.#piece.board.space(x, y + v);

                            // get potential en Passant space: same y offset as before, but removing the original x offset
                            const epTarg = this.#piece.board.space(x - move[1], y + v);

                            // idk if I want to comment this because it's a lot, but suffice to say it checks both spaces and if either has a valid capture, it adds the normal capture space to the list of valid moves
                            if((pawnCapt && pawnCapt.piece.real && pawnCapt.piece.color !== this.#piece.color) || (epTarg && epTarg.piece.type === 'pawn' && epTarg.piece.color !== this.#piece.color && epTarg.piece.enPassantable)) validMoves.push(pawnCapt.xy);

                            // marks both spaces (it's a debug thing)
                            pawnCapt?.element?.classList.add('visited');
                            epTarg?.element?.classList.add('visited');
                        }
                    );

                    // exit if pawn blockage is happening: no other moves are possible
                    if (targ.piece.real) return;

                    // pawn double move if it hasn't moved yet 
                    if (!this.#piece.hasMoved) {

                        // add the x offset again to get the space in front of the target space
                        const doubleMove = this.#piece.board.space(x + move[1], y);

                        // if the space is empty it's a valid start move
                        if (!doubleMove.piece.real) validMoves.push(doubleMove.xy);
                    }

                    // add the move to the list
                    validMoves.push(targ.xy);
                }

                else if(this.#piece.type === 'king') {
                    // WIP

                    // check castle


                    // ignore spaces that put in check
                    if(this.#piece.board.targets.includes(targ)) return;


                    // check already in check
                }

                // if the target space exists and any piece in that space has a different color...
                if (targ && targ.piece.color !== this.#piece.color) {

                    // mark it as visited
                    targ?.element?.classList.add('visited');

                    // add it to the list
                    validMoves.push(targ.xy);
                }
            }
        });

        const king = this.#piece.color === 'white' 
            ? this.#piece.board.whiteKing 
            : this.#piece.board.blackKing;

        //if(king.inCheck) {
        //    validMoves.forEach(move => {
        //        console.log(move);
        //    });
        //}

        // WIP
        // it MIGHT be a checkmate if the piece is a king, it's in check, and there are no valid moves.
        // there are more checks to make to be sure, but I haven't made those yet
        if(this.#piece.type === 'king' && this.#piece.inCheck && validMoves.length === 0) alert('Checkmate..?');

        // save the moves for future reference
        this.#moves = validMoves;
    }

    get moves(     ) { this.refreshMoves(); return this.#moves; }
    set moves(moves) { this.#moves = moves; return this;        }
}

export default Move;
