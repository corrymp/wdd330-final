import { xyToIndex, pawn, rook, bishop, queen, king, white } from './utils.mjs';

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

const knightMoves = [[1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1], [2, 1]];

const moveTypes = {
    king: square,
    queen: square,
    rook: cross,
    bishop: diagonals,
    knight: knightMoves,
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
    #board = null;

    constructor(main, piece) { this.main = main; this.#piece = piece; this.#board = piece.board }

    refreshMoves() {
       
        // this will hold all the valid moves as they are determined
        const validMoveSet = new Set;
        const targets = this.#board.targets;
        const piece = this.#piece;
        const type = piece.type;
        const color = piece.color;
        const inCheck = piece.inCheck;
        const hasMoved = piece.hasMoved;
        const space = piece.space;
        const checks = piece.board.checks;
        const blocks = piece.board.blocks;

        // gets the base move template for the given piece
        let baseMoves = moveTypes[this.#piece.type];

        // inverts the moveset for white pawns
        if (type === pawn && color === white) baseMoves = baseMoves.map(move => move.map(i => -i));

        else if (type === king && !hasMoved && !inCheck) {
            const qsRook = color === white ? this.#board.whiteQSRook : this.#board.blackQSRook;
            const ksRook = color === white ? this.#board.whiteKSRook : this.#board.blackKSRook;

            // gets the index of the king
            const y = space.y;

            // gets all the spaces involved in both types of castles
            const [qsNSpace, qsBSpace, qSpace, kSpace, ksBSpace, ksNSpace] = [1, 2, 3, 4, 5, 6].map(x => this.#board.space(xyToIndex(x, y)));

            // empty d file, c file, b file, unmoved room in a file, d and c files unattacked
            if (
                qsRook && !qsRook.hasMoved &&
                qSpace.isEmpty && !targets.includes(qSpace) &&
                qsBSpace.isEmpty && !targets.includes(qsBSpace) &&
                qsNSpace.isEmpty && !targets.includes(kSpace)
            ) baseMoves.push(...moveTypes.kingQueensideCastle);

            // empty f file, g file, unmoved rook in h file, f and g files unattacked
            if (
                ksRook && !ksRook.hasMoved &&
                ksBSpace.isEmpty && !targets.includes(ksBSpace) &&
                ksNSpace.isEmpty && !targets.includes(ksNSpace)
            ) baseMoves.push(...moveTypes.kingKingsideCastle);
        }

        baseMoves.forEach(move => {
            // xy coords for the origin space
            let x = space.x;
            let y = space.y;

            // infinite movement pieces
            // if you add 'knight' to this list, the game gets 20% cooler
            if ([queen, rook, bishop].includes(type)) {

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
                    const targ = this.#board.space(x, y);

                    // stops the trace if there is no space (should never happen, but you never know)
                    if (!targ) break;

                    // if the targeted piece is not the same color as the attacking piece add the coords to the list of valid moves
                    if (targ.piece?.color !== color) validMoveSet.add(targ.xy);

                    // end the trace if the givin space contains a piece
                    if (targ.piece.real) break;
                }
            }

            // everything else
            else {
                // offset the space coords based on the move
                y += move[1];
                x += move[0];

                // get thr targeted space
                const targ = this.#board.space(x, y);

                // handle pawn logic
                if (type === pawn) {

                    // normal pawn capture mechanics + e n  p a s s a n t
                    // does everything twice: once in the positive direction, once in the negetive
                    [1, -1].forEach(
                        v => {
                            // get potential capture space: same x, offset y by one(+-)
                            const pawnCapt = this.#board.space(x + v, y);

                            // get potential en Passant space and subject
                            const epTarg = this.#board.enPassantTarget;
                            const epSub = this.#board.enPassantSubject;

                            // idk if I want to comment this because it's a lot, but suffice to say it checks both spaces and if either has a valid capture, it adds the normal capture space to the list of valid moves
                            if (pawnCapt && ((epTarg && pawnCapt === epTarg && epSub.piece.color !== color) || (pawnCapt.piece.real && pawnCapt.piece.color !== color))) validMoveSet.add(pawnCapt.xy);
                        }
                    );

                    // exit if pawn blockage is happening: no other moves are possible
                    if (targ.piece.real) return;

                    // pawn double move if it hasn't moved yet 
                    if (!hasMoved) {

                        // add the x offset again to get the space in front of the target space
                        const doubleMove = this.#board.space(x, y + move[1]);

                        // if the space is empty it's a valid start move
                        if (!doubleMove.piece.real) validMoveSet.add(doubleMove.xy);
                    }

                    // add the move to the list
                    validMoveSet.add(targ.xy);
                }

                else if (type === king) {

                    // ignore spaces that put in check
                    if (targets.includes(targ)) return;


                    // check already in check
                }

                // add it to the list if the target space exists and any piece in that space has a different color
                if (targ && targ.piece.color !== color) validMoveSet.add(targ.xy);
            }
        });

        const validMoves = Array.from(validMoveSet);

        // it MIGHT be a checkmate if the piece is a king, it's in check, and there are no valid moves.
        // there are more checks to make to be sure, but I haven't made those yet
        if (type === king && inCheck && validMoves.length === 0) alert('Checkmate..?');

        // save the moves for future reference
        this.#moves = validMoves;
    }

    get moves() { this.refreshMoves(); return this.#moves; }
    set moves(moves) { this.#moves = moves; }
}

export default Move;
