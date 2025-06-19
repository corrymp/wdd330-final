export default class History {
    #game = null;
    
    #element = null;
    get element() {return this.#element;}
    
    #history = [];
    get history() {return this.#history;}
    get lastHistory() {return this.#history[this.#history.length - 1];}
    
    get historyAsUrl() {
        let string = '';

        for(const line of this.history) {
            const turn = line.turn;
            const whiteMove = line.white;
            const blackMove = line.black;

            string += `/${turn}._${whiteMove}`;
            
            if(blackMove) string += `/${turn}...${blackMove}`;
        }

        return string;
    }

    constructor(main, game, element) {
        this.main = main;
        this.#game = game;
        this.#element = element;
    }

    addHistory(item) {
        // sets the turn number, set white's move, add item to history
        if(this.#history.length !== this.#game.fullmoveNumber) this.#history.push({
            turn: this.#game.fullmoveNumber,
            white: item,
            black: null
        });

        // set black's move
        else this.lastHistory.black = item;

        return this;
    }

    updateDisplay() {
        if(!this.#element.children.length || this.#element.lastElementChild.lastElementChild.textContent) {
            const row = this.#element.appendChild(document.createElement('tr'));
            row.appendChild(document.createElement('th')).textContent = this.lastHistory.turn + '.';
            row.appendChild(document.createElement('td')).textContent = this.lastHistory.white;
            row.appendChild(document.createElement('td'));
        }
        else this.#element.lastElementChild.lastElementChild.textContent = this.lastHistory.black;

        this.#element.scroll({
            top: this.#element.scrollTopMax,
            behavior: 'smooth'
        });

        return this;
    }
}
/*
1.	N  f3 	N  f6 
2.	   c4 	   g6 
3.	N  c3 	B  g7 
4.	   d4 	O-O 
5.	B  f4 	   d5 
6.	Q  b3 	dx c4 
7.	Qx c4 	   c6 
8.	   e4 	Nb d7 
9.	R  d1 	N  b6 
10.	Q  c5 	B  g4 
11.	B  g5 	N  a4 
12.	Q  a3 	Nx c3 
13.	bx c3 	Nx e4 
14.	Bx e7 	Q  b6 
15.	B  c4 	Nx c3 
16.	B  c5 	Rf e8+ 
17.	K  f1 	B  e6 
18.	Bx b6 	Bx c4+ 
19.	K  g1 	N  e2+ 
20.	K  f1 	Nx d4+ 
21.	K  g1 	N  e2+ 
22.	K  f1 	N  c3+ 
23.	K  g1 	ax b6 
24.	Q  b4 	R  a4 
25.	Qx b6 	Nx d1 
26.	   h3 	Rx a2 
27.	K  h2 	Nx f2 
28.	R  e1 	Rx e1 
29.	Q  d8+ 	B  f8 
30.	Nx e1 	B  d5 
31.	N  f3 	N  e4 
32.	Q  b8 	   b5 
33.	   h4 	   h5 
34.	N  e5 	K  g7 
35.	K  g1 	B  c5+ 
36.	K  f1 	N  g3+ 
37.	K  e1 	B  b4+ 
38.	K  d1 	B  b3+ 
39.	K  c1 	N  e2+ 
40.	K  b1 	N  c3+ 
41.	K  c1 	R  c2# 0-1
*/
