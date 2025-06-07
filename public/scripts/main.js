import Board from "./Board.mjs";
import API from "./api.mjs";

console.log('Home page loaded');

const _board = new Board(board);

const testLichess = new API('https://lichess.org/api/cloud-eval', 'GET');
const testChessApi = new API('https://chess-api.com/v1', 'POST');
const testWikibookApi = new API('https://en.wikibooks.org/w/api.php', 'GET');

