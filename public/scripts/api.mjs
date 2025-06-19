// ChessAPI Request structure
/**
 * @method POST
 * @param {string} fen              - FEN string
 * @param {number} variants         - optional - [default: 1, max: 5]
 * @param {number} depth            - optional - [default: 12 (IM), max: 18 (GM) (20: Magnus Carlsen)]
 * @param {number} maxThinkingTime  - optional - [default: 50, max: 100]
 * @param {string} searchmoves      - optional - specific moves to evaluate
 * @returns {ChessApiResponse} 
 */

// ChessAPI Response structure
/**
 * @typedef ChessApiResponse
 * @type {object}
 * @property {"move"|"bestmove"|"info"} type    - Response types can be categorized as "move," "bestmove," or "info." Messages of type "move" are delivered progressively, indicating that the engine has identified a promising move at a given depth. The final message, denoted as "bestmove," represents the optimal move proposed among those identified. Additionally, "info" messages may include supplementary details such as status updates or error notifications. 
 * @property {number} eval                      - Position evaluation. Negative value means that black is winning.
 * @property {number} depth                     - The depth at which the move was discovered is significant, as higher depths typically correlate with greater accuracy. For context, a depth of 12 corresponds to approximately 2350 FIDE elo, akin to the level of International Masters like Eric Rosen or Levy Rozman. A depth of 18 equates to around 2750 FIDE elo, reflective of the skill level of Grandmaster Hikaru Nakamura. Furthermore, a depth of 20 corresponds to approximately 2850 FIDE elo, indicative of the caliber of Grandmaster Magnus Carlsen. 
 * @property {string} text                      - Textual description of data.
 * @property {number} winCnance                 - Winning chance: value 50 (50%) means that position is equal. Over 50 - white is winning. Below 50 - black is winning. This is calculated using Lichess formula (Win% = 50 + 50 * (2 / (1 + exp(-0.00368208 * centipawns)) - 1)).
 * @property {number} mate                      - Forced mate sequence detected (number shows how many moves have to be played to mate opponent's king). Negative numbers concern black pieces. 
 * @property {string} san                       - Short algebraic notation of move.
 * @property {object[]} continuationArr         - Array of next moves to be played in suggested variant.
 * @property {string} continuationArr[]         - 
 * @property {string} from                      - Move coordinations on the board.
 * @property {string} to                        - Move coordinations on the board.
 * @property {string} fromNumeric               - Move coordinations on the board.
 * @property {string} toNumeric                 - Move coordinations on the board.
 * @property {string} captured                  - Information about captured piece (if any). 
 * @property {"w"|"b"} turn                     - Current player's turn.
 * @property {string} piece                     - Piece type.
 * @property {string} taskId                    - Task identifier.
 * @property {"r"|"n"|"b"|"q"} promotion        - If move is promotion, piece symbol will be here.
 * @property {boolean} isCastling               - whether move is castling.
 * @property {boolean} isCapture                - Whether move is capture.
 * @property {string} flags                     - Contains one or more of the string values: n - a non-capture / b - a pawn push of two squares / e - an en passant capture / c - a standard capture / p - a promotion / k - kingside castling / q - queenside castling. 
*/

// Lichess API Request structure
/**
 * @method GET
 * @param {string} fen      - FEN string
 * @param {number} multiPv  - Optional - Number of variations
 * @param {"standard"|"chess960"|"crazyhouse"|"antichess"|"atomic"|"horde"|"kingOfTheHill"|"racingKings"|"threeCheck"|"fromPosition"} variant - Optional - Variant
 * @returns {LichessApiResponse}
 */

// Lichess API response structure
/**
 * @typedef LichessApiResponse
 * @type {object}
 * @property {number} depth         - 
 * @property {string} fen           - FEN string
 * @property {number} knodes        - 
 * @property {object[]} pvs         - Array of Non-mate variation (object) or Mate variation (object)
 * @property {number} pvs[].cp      - Evaluation in centi-pawns, from White's point of view
 * @property {number} pvs[].mate    - Evaluation in moves to mate, from White's point of view
 * @property {string} pvs[].moves   - Variation in UCI notation ({start space}{end space} {start space}{end space} {etc.})
 * @property {string} error         - 404: position not found
 */

class API {
    constructor(main, apiUrl, format) {
        this.main = main;
        this.url = apiUrl;

        if (['GET', 'POST'].includes(format)) this.format = format;
        else throw new Error('Only GET and POST requests are supported.');
    }

    async callApi(payload) {
        const request = this.format === 'GET' ? [this.buildGetUrl(payload)] : [this.url, this.prepPostPayload(payload)];
        let response = null;
        let parsedResponse = null;

        try {
            response = await fetch(...request);
        }
        catch (e) {
            console.error('Error with API request:', request, e);
            return false;
        }

        try {
            parsedResponse = await response.json();
        }
        catch (e) {
            console.error('Error parsing API response:', request, response, e);
            return false;
        }

        return parsedResponse;
    }

    buildGetUrl = params => `${this.url}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;

    prepPostPayload = payload => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

export default API;
