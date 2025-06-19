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

// Can't see anything in dev tools without this
window.main = class Main {
    static game = new Game(
        this, 
        document.getElementById('board'),
        document.getElementById('historyList'), 
        document.getElementById('analysis'), 
        testBoard ? testSetup : null
    );

    static test = new Test(this);
    static lichessApi = new API(this, 'https://lichess.org/api/cloud-eval', 'GET');
    static chessApi = new API(this, 'https://chess-api.com/v1', 'POST');
    static wikibookApi = new API(this, 'https://en.wikibooks.org/w/api.php', 'GET');
}
window.game = window.main.game;
window.board = window.game.board;

const savedGame = JSON.parse(localStorage.getItem('saveData')) || null;

if(savedGame) window.main.game.loadSave(savedGame);
else window.main.game.board.setupBoard();

document.getElementById('reset').addEventListener('click',window.main.game.deleteSave);

document.addEventListener('keydown', e => {
    switch (e.key) {

        case 'Enter': window.main.test.runAllTests(); break;
        case 'Shift': console.log(window.main.game.board); break;

        case '3': window.main.game.board.spaces.forEach(space => console.log(`${space.element.dataset.fr} | ${space.element.dataset.file}${space.element.dataset.rank} | ${space.file}${space.rank} | (${space.x},${space.y}):(${space.element.dataset.x},${space.element.dataset.y}) | ${space.element.dataset.symbol ?? '-'}`)); break;

        case '2': window.main.game.board.spaces.forEach(space => console.log(`${space.element.dataset.file}${space.element.dataset.rank} (x${space.element.dataset.x},y${space.element.dataset.y}) | ${space?.piece?.type ? space.piece.type : '- - -'}`)); break;

        case '1': {
            const boardStrings = ['', '', '', '', '', '', '', '',];
            const styleStrings = [];
            const backgroundColors = ['555', 'aaa'];
            let boardIndex = 0;
            let rowIndex = 0;

            window.main.game.board.spaces.forEach(space => {
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

// main.game.runMoves(`1. Nf3 Nf6 
// 2. c4 g6 
// 3. Nc3 Bg7 
// 4. d4 O-O 
// 5. c5 b5 
// 6. cxb6 axb6 
// 7. a4 b5 
// 8. axb5 Rxa1 
// 9. b6 c5 
// 10. e4 cxd4 
// 11. Bc4 d3 
// 12. O-O d2 
// 13. Qb3 Nxe4 
// 14. Re1 dxe1=Q+ 
// 15. Nxe1 Nxc3 
// 16. bxc3 Rxc1 
// 17. Bf1 Ba6 
// 18. c4 Bxc4 
// 19. Qe3 d5 
// 20. Qxc1 Bxf1 
// 21. Kxf1 Na6 
// 22. Qb1 d4 
// 23. b7 d3 
// 24. Nxd3 Qd5 
// 25. h4 Nb8 
// 26. Qc2 Rd8 
// 27. Ne1 Bf6 
// 28. Kg1 Bxh4 
// 29. Nf3 Qd1+ 
// 30. Qxd1 Rxd1+ 
// 31. Kh2 Bxf2 
// 32. Ng5 Bc5 
// 33. Kh3 Rh1+ 
// 34. Kg3 Rb1 
// 35. Ne4 Bd6+ 
// 36. Kf3 Kg7 
// 37. Nd2 Rd1 
// 38. Ne4 e5 
// 39. Ke2 Rd5 
// 40. Nc3 Rc5 
// 41. Ne4 Be7 
// 42. Kd3 Rc7 
// 43. Nf2 Rc5 
// 44. Ke4 Rb5 
// 45. g4 Rb4+ 
// 46. Kxe5 Bc5 
// 47. Ne4 Be3 
// 48. Nc3 Bd4+ 
// 49. Ke4 Bxc3+ 
// 50. Kd5 Be1 
// 51. Kc5 Kf8 
// 52. Kd6 Na6 
// 53. g5 Kg7 
// 54. Kd7 h5 
// 55. gxh6+ Kh7 
// 56. Ke7 f5 
// 57. Kd7 f4 
// 58. Kc8 f3 
// 59. b8=Q Rxb8+ 
// 60. Kd7 f2 
// 61. Ke7 Rb7+ 
// 62. Ke6 Rb6+ 
// 63. Ke5 Rb5+ 
// 64. Ke4 Rf5 
// 65. Ke3 Nc7 
// 66. Ke2 Ne8 
// 67. Kf1 Kg8 
// 68. Kg2 Ra5 
// 69. h7+ Kf7 
// 70. h8=Q Ra8 
// 71. Kf1 Ba5 
// 72. Qc3 Bd8 
// 73. Qc1 Nf6 
// 74. Qd1 Ng8 
// 75. Ke2 f1=Q+ 
// 76. Kd2 Qf6 
// 77. Ke1 Ke8 
// 78. Qc1 Be7 
// 79. Qd1 Bf8 
// 80. Qd2 Qd8 
// 81. Qd1 g5 
// 82. Qc1 g4 
// 83. Qc2 g3 
// 84. Qc1 g2 
// 85. Qd1 g1=N 
// 86. Qc1 Nf3+ 
// 87. Kf1 Ne5 
// 88. Qd1 Nc6 
// 89. Ke1 Nb8 
// 90. Ke2 Nc6 
// 91. Qd3 Nd4+ 
// 92. Qxd4 Ra2+ 
// 93. Kd3 Rd2+ 
// 94. Kxd2 Bb4+ 
// 95. Kd3 Nf6 
// 96. Ke3 Bc5 
// 97. Qxc5 Qe7+ 
// 98. Kd4 Nd7 
// 99. Qd5 Nc5 
// 100. Qxc5 Qxc5+ 
// 101. Kxc5  1/2-1/2`);
