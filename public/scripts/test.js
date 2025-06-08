import API from "./api.mjs";

const lichessAPI = new API('https://lichess.org/api/cloud-eval', 'GET');
const chessAPI = new API('https://chess-api.com/v1', 'POST');
const wikibookAPI = new API('https://en.wikibooks.org/w/api.php', 'GET');

const lichessReq = {
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    multiPv: 1,
    variant: 'standard'
}

const chessApiReq = {
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2',
    variants: 1,
    depth: 12,
    maxThinkingTime: 50
}

const wikibookApiReq = {
    titles: 'Chess_Opening_Theory/1._e4/1...c5/2._Nf3',
    origin: '*',
    action: 'query',
    prop: 'extracts',
    formatversion: 2,
    format: 'json',
    exchars: 1200
}

const baseFetch = window.fetch;

window.fetch = function fetch(...args) {
    console.log('new FETCH request', args);
    return baseFetch(...args);
}

const runTest = async (api, req, expect) => {
    let res = null;
    try {
        res = await api.callApi(req);
    }
    catch (e) {
        res = e;
    }
    finally {
        console.log(res);
    }
}

runTest(lichessAPI, lichessReq, lichessResponse);
runTest(chessAPI, chessApiReq, lichessResponse);
