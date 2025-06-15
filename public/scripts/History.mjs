export default class History {
    #history = null;
    #game = null;

    constructor(game) {this.#game = game;}

    get history() {return this.#history;}

    addHistory(item) {

        // template of history item
        const historyTemplate = {
            turn: null,
            white: null,
            black: null
        };

        if(
            // adds a new item if there are none, or...
            this.#history.length === 0 || 

            // adds a new item if no turn is set
            !this.#history[this.#history.length - 1].turn
        ) {
            // sets the turn number
            historyTemplate.turn = this.#game.fullmoveNumber;

            // set white's move
            historyTemplate.white = item;

            // add item to history
            this.#history.push(historyTemplate);
        }
        else {
            // set black's move
            this.#history[this.#history.length - 1].black = item;
        }
    }
}
