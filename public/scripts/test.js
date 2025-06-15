
const baseFetch = window.fetch;

window.fetch = function fetch(...args) {
    console.log('new FETCH request', args);
    return baseFetch(...args);
}

const lichessApiReq = {
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

const runTest = async (api, req) => {
    let res = null;
    try {       res = await api.callApi(req); }
    catch (e) { res = e;                      }
    finally {   console.log(res);             }
}

const testBoard = (board) => {
    for(const space of board.spaces) {
        const spaceEl = space.element;

        const [spRnkFile,spFleRank] = spaceEl.dataset.space.split('');
        const elementRank = spaceEl.dataset.rank + '';
        const elementFile = spaceEl.dataset.file + '';
        const elementX = spaceEl.dataset.x + '';
        const elementY = spaceEl.dataset.y + '';
        const spaceRank = space.rank + '';
        const spaceFile = space.file + '';
        const spaceX = space.x + '';
        const spaceY = space.y + '';

        if(spFleRank === spaceRank && spaceRank === elementRank && elementRank === spFleRank &&spRnkFile === spaceFile && spaceFile === elementFile && elementFile === spRnkFile &&spaceX === elementX && spaceY === elementY) console.log(`Well that's a miricle! ${spFleRank}${spaceRank}${elementRank} ${spRnkFile}${spaceFile}${elementFile} ${spaceX}${elementX} ${spaceY}${elementY}`);
        else {
            console.log(`${spRnkFile}${elementFile}${spaceFile} ${spFleRank}${elementRank}${spaceRank} ${spaceX}${elementX} ${spaceY}${elementY}`);
            console.assert(spFleRank === spaceRank && spaceRank === elementRank, `Rank: ${spFleRank}${elementRank}${spaceRank} (elSpace,element,space)`);
            console.assert(spRnkFile === spaceFile && spaceFile === elementFile,`File: ${spRnkFile}${elementFile}${spaceFile} (elSpace,element,space)`);
            console.assert(spaceX === elementX,`X: ${spaceX}${elementX} (space,element)`);
            console.assert(spaceY === elementY,`Y: ${spaceY}${elementY} (space,element)`);
        }
    }
}

export default class Test {
    constructor(main) {
        this.main = main;
    }

    runAllTests() {
        this.testBoardNotation();
        this.testLichessAPI();
        this.testChessAPI();
        this.testWikibookAPI();
    }

    testBoardNotation() {testBoard( this.main.game.board                 );}
    testLichessAPI(   ) {runTest(   this.main.lichessApi,  lichessApiReq );}
    testChessAPI(     ) {runTest(   this.main.chessApi,    chessApiReq   );}
    testWikibookAPI(  ) {runTest(   this.main.wikibookApi, wikibookApiReq);}
}
