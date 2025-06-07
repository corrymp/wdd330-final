import Space from './Space.mjs';
import Piece from './Piece.mjs';


const defaultSetup = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [   ,   ,   ,   ,   ,   ,   ,   ],
    [   ,   ,   ,   ,   ,   ,   ,   ],
    [   ,   ,   ,   ,   ,   ,   ,   ],
    [   ,   ,   ,   ,   ,   ,   ,   ],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R'],
];

const setupBoardObject = (setup) => {
    const _setup = setup ?? defaultSetup;
    let b = [];
    for (let y = 0; y < 8; y++) {
        const r = [];
        for (let x = 0; x < 8; x++) r.push(new Space(y, x, new Piece(_setup[x][y] ?? false)));
        b.push(r);
    }
    return b;
};

const setupSpaces = (boardEl, board) => {
    for (const space of boardEl.querySelectorAll('.space')) {
        const rank = space.dataset.rank;
        const file = space.dataset.file;

        const x = space.dataset.x;
        const y = space.dataset.y;

        console.assert(space.dataset.space === `${space.dataset.file}${space.dataset.rank}` && `${space.dataset.file}${space.dataset.rank}` === `${file}${rank}`);

        const piece = board[x][y];

        //space.style.color = piece.piece.colorCode;
        //space.style.textShadow = `0 0 2em ${piece.piece.colorCode}`;
        space.piece = piece;
        space.dataset.symbol = piece.piece.symbol ?? '';
        space.dataset.color = piece.piece.color;

        space.addEventListener('click', function (e) {
            console.log(this.dataset.space, `${this.dataset.x},${this.dataset.y}`, this.piece.piece.symbol);
        });
    };
};

class Board {
    constructor(boardEl, setup) {
        this.boardEl = boardEl;
        this.board = setupBoardObject(setup);
        setupSpaces(boardEl, this.board);
    }
};

export default Board;
