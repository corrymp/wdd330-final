import API from './api.mjs';
import Game from './Game.mjs';
import Test from './test.js';

// true: use test board setup, false: use normal board setup
const testBoard = false;

// test board setup
const testSetup = [
    [   ,'n','b','q','k',   ,'n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['r',   ,   ,'P',   ,   ,   ,'b'],
    [   ,'N',   ,   ,   ,   ,   ,   ],
    [   ,   ,'N',   ,'P',   ,   ,   ],
    [   ,   ,'P',   ,   ,'B','N',   ],
    ['P','P','N',   ,   ,'P','P','P'],
    ['R',   ,'B','Q','K',   ,   ,'R']
];

class Main {
    static game = new Game(this, document.getElementById('board'), testBoard ? testSetup : null);
    static test = new Test(this);
    static lichessApi = new API('https://lichess.org/api/cloud-eval', 'GET');
    static chessApi = new API('https://chess-api.com/v1', 'POST');
    static wikibookApi = new API('https://en.wikibooks.org/w/api.php', 'GET');
}

// Can't see anything in dev tools without this
window.main = Main;


/*
Project structure:
- script => global script; used on every page; handles universal site mechanics like DM

- main  => calls all the shots
- api   => calls the APIs and returns their responses; abstracts and simplifies the way they are called; 
- Board => builds the board object, assigns data to board elements, keeps track of piece placement
- Game  => handles FEN strings, turns, and overall game logic
- History => stores game history and updates the display
- Move  => constructs the valid moveset for each piece each turn
- Piece => stores information on each piece; tracks whether or not a piece has moved
- Space => acts as a go-between for the board and pieces; keeps track of the board coordinates and what piece is at those coordinates

- test  => runs tests to ensure the integrity of the game logic; calls every function with both valid and invalid parameters to find the gaps

Board > Space > Piece > Move

notation goes 'file,rank': 'e1', 'g7', etc.
This = (y,x)

file =  up,down     = y,-y = letter
rank = left,right   = x,-x = number

file    abcdefgh
x       01234567

rank    87654321
y       01234567

a8 = 0,0
h8 = 7,0
a1 = 0,7
h1 = 7,7

History:
    - layout: {fullMove} {whiteMove} {blackMove}
      - fullMove: current fullmove
      - whiteMove: algebraic move notation of the most recent move by white
      - blackMove: algebraic move notation of the most recent move by black

*/

document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'Enter': Main.test.runAllTests(); break;
        case 'Shift': console.log(Main.game.board); break;

        case '3': Main.game.board.spaces.forEach(space => console.log(`${space.element.dataset.space} | ${space.element.dataset.file}${space.element.dataset.rank} | ${space.file}${space.rank} | (${space.x},${space.y}):(${space.element.dataset.x},${space.element.dataset.y}) | ${space.element.dataset.symbol ?? '-'}`)); break;

        case '2': Main.game.board.spaces.forEach(space => console.log(`${space.element.dataset.file}${space.element.dataset.rank} (x${space.element.dataset.x},y${space.element.dataset.y}) | ${space?.piece?.type ? space.piece.type : '- - -'}`)); break;

        case '1': {
            const boardStrings = ['', '', '', '', '', '', '', '',];
            const styleStrings = [];
            const backgroundColors = ['555', 'aaa'];
            let boardIndex = 0;
            let rowIndex = 0;

            Main.game.board.spaces.forEach(space => {
                const bg = backgroundColors[(boardIndex % 2 === rowIndex % 2) * 1];

                if (space.piece.real) {
                    switch (space.piece.color) {
                        case 'white': styleStrings.push(`background-color:#${bg};color:#fefefe`); break;
                        case 'black': styleStrings.push(`background-color:#${bg};color:#0e0e0e`); break;
                    }

                    boardStrings[rowIndex] += `%c ${space.piece.notation} `;
                }
                else {
                    styleStrings.push(`background-color:#${bg};color:#0000`);
                    boardStrings[rowIndex] += '%c - ';
                }

                if (++boardIndex % 8 === 0) {
                    rowIndex++;
                    styleStrings.push(`background-color:unset;color:unset`);
                }
            });

            console.log(
                `   A  B  C  D  E  F  G  H
8 ${boardStrings[0]}%c 0
7 ${boardStrings[1]}%c 1
6 ${boardStrings[2]}%c 2
5 ${boardStrings[3]}%c 3
4 ${boardStrings[4]}%c 4
3 ${boardStrings[5]}%c 5
2 ${boardStrings[6]}%c 6
1 ${boardStrings[7]}%c 7
   0  1  2  3  4  5  6  7`,
                ...styleStrings
            );

            break;
        }
    }
});
