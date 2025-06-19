
//const baseFetch = window.fetch;
//
//window.fetch = function fetch(...args) {
//    console.log('new FETCH request', args);
//    return baseFetch(...args);
//}

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
    for(const sp of board.spaces) {
        const el = sp.element;
        const o1 = board.space(sp.file, sp.rank);
        const o2 = board.space(sp.rank, sp.file);
        const ar = board.space(sp.x, sp.y);
        const e1 = o1.element;
        const e2 = o2.element;
        const ea = ar.element;

        const fr_space  = el.dataset.fr.split('');
        const fr_obj1   = e1.dataset.fr.split('');
        const fr_obj2   = e2.dataset.fr.split('');
        const fr_arr    = ea.dataset.fr.split('');
        const xy_space  = el.dataset.xy.split(',');
        const xy_obj1   = e1.dataset.xy.split(',');
        const xy_obj2   = e2.dataset.xy.split(',');
        const xy_arr    = ea.dataset.xy.split(',');

        //    Space                 Object1             Object2             Array
        const r0=fr_space[1],       r1=fr_obj1[1],      r2=fr_obj2[1],      r3=fr_arr[1];
        const f0=fr_space[0],       f1=fr_obj1[0],      f2=fr_obj2[0],      f3=fr_arr[0];
        const x0=xy_space[0],       x1=xy_obj1[0],      x2=xy_obj2[0],      x3=xy_arr[0];
        const y0=xy_space[1],       y1=xy_obj1[1],      y2=xy_obj2[1],      y3=xy_arr[1];

        const r4=el.dataset.rank,   r5=e1.dataset.rank, r6=e2.dataset.rank, r7=ea.dataset.rank;
        const f4=el.dataset.file,   f5=e1.dataset.file, f6=e2.dataset.file, f7=ea.dataset.file;
        const x4=el.dataset.x,      x5=e1.dataset.x,    x6=e2.dataset.x,    x7=ea.dataset.x;
        const y4=el.dataset.y,      y5=e1.dataset.y,    y6=e2.dataset.y,    y7=ea.dataset.y;

        const r8=sp.rank + '',      r9=o1.rank + '',    ra=o2.rank + '',    rb=ar.rank + '';
        const f8=sp.file + '',      f9=o1.file + '',    fa=o2.file + '',    fb=ar.file + '';
        const x8=sp.x + '',         x9=o1.x + '',       xa=o2.x + '',       xb=ar.x + '';
        const y8=sp.y + '',         y9=o1.y + '',       ya=o2.y + '',       yb=ar.y + '';

        
        if(
            r0 === r1 && r1 === r2 && r2 === r3 && r3 === r4 && r4 === r5 && r5 === r6 && 
            r6 === r7 && r7 === r8 && r8 === r9 && r9 === ra && ra === rb && rb === r0 && 
            f0 === f1 && f1 === f2 && f2 === f3 && f3 === f4 && f4 === f5 && f5 === f6 && 
            f6 === f7 && f7 === f8 && f8 === f9 && f9 === fa && fa === fb && fb === f0 && 
            x0 === x1 && x1 === x2 && x2 === x3 && x3 === x4 && x4 === x5 && x5 === x6 && 
            x6 === x7 && x7 === x8 && x8 === x9 && x9 === xa && xa === xb && xb === x0 && 
            y0 === y1 && y1 === y2 && y2 === y3 && y3 === y4 && y4 === y5 && y5 === y6 && 
            y6 === y7 && y7 === y8 && y8 === y9 && y9 === ya && ya === yb && yb === y0
        ) {
            console.log(`Well that's a miricle! ${r0}${r1}${r2}${r3}${r4}${r5}${r6}${r7}${r8}${r9}${ra}${rb} ${f0}${f1}${f2}${f3}${f4}${f5}${f6}${f7}${f8}${f9}${fa}${fb} ${x0}${x1}${x2}${x3}${x4}${x5}${x6}${x7}${x8}${x9}${xa}${xb} ${y0}${y1}${y2}${y3}${y4}${y5}${y6}${y7}${y8}${y9}${ya}${yb}`);
        }
        else {
            console.log(`\
el  cls   el cls
${sp.element.dataset.x   },${sp.element.dataset.y   } ${sp.x   },${sp.y   }   \
${sp.element.dataset.file }${sp.element.dataset.rank} ${sp.file }${sp.rank}; 
${o1.element.dataset.x   },${o1.element.dataset.y   } ${o1.x   },${o1.y   }   \
${o1.element.dataset.file }${o1.element.dataset.rank} ${o1.file }${o1.rank}; 
${o2.element.dataset.x   },${o2.element.dataset.y   } ${o2.x   },${o2.y   }   \
${o2.element.dataset.file }${o2.element.dataset.rank} ${o2.file }${o2.rank}; 
${ar.element.dataset.x   },${ar.element.dataset.y   } ${ar.x   },${ar.y   }   \
${ar.element.dataset.file }${ar.element.dataset.rank} ${ar.file }${ar.rank};

------------------------
  | rfxy | data | clss |
  | E12A | E12A | E12A |
--|------|------|------|
R:| ${r0}${r1}${r2}${r3} | ${r4}${r5}${r6}${r7} | ${r8}${r9}${ra}${rb} |
F:| ${f0}${f1}${f2}${f3} | ${f4}${f5}${f6}${f7} | ${f8}${f9}${fa}${fb} | 
X:| ${x0}${x1}${x2}${x3} | ${x4}${x5}${x6}${x7} | ${x8}${x9}${xa}${xb} | 
Y:| ${y0}${y1}${y2}${y3} | ${y4}${y5}${y6}${y7} | ${y8}${y9}${ya}${yb} |
------------------------`);
            
            console.assert(r0 === r1 && r1 === r2 && r2 === r3 && r3 === r4 && r4 === r5 && r5 === r6 && r6 === r7 && r7 === r8 && r8 === r9 && r9 === ra && ra === rb && rb === r0, `Rank: ${    r0}${r1}${r2}${r3}${r4}${r5}${r6}${r7}${r8}${r9}${ra}${rb}`);

            console.assert(f0 === f1 && f1 === f2 && f2 === f3 && f3 === f4 && f4 === f5 && f5 === f6 && f6 === f7 && f7 === f8 && f8 === f9 && f9 === fa && fa === fb && fb === f0, `File: ${f0}${f1}${f2}${f3}${f4}${f5}${f6}${f7}${f8}${f9}${fa}${fb}`);

            console.assert(x0 === x1 && x1 === x2 && x2 === x3 && x3 === x4 && x4 === x5 && x5 === x6 && x6 === x7 && x7 === x8 && x8 === x9 && x9 === xa && xa === xb && xb === x0, `X: ${x0}${x1}${x2}${x3}${x4}${x5}${x6}${x7}${x8}${x9}${xa}${xb}`);

            console.assert(y0 === y1 && y1 === y2 && y2 === y3 && y3 === y4 && y4 === y5 && y5 === y6 && y6 === y7 && y7 === y8 && y8 === y9 && y9 === ya && ya === yb && yb === y0, `Y: ${y0}${y1}${y2}${y3}${y4}${y5}${y6}${y7}${y8}${y9}${ya}${yb}`);
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
