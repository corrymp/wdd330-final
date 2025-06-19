import { pawn, rook, knight, bishop, queen, king, black, white } from './utils.mjs';

export default class Analysis {
    #analysisEl = null;

    #analysisBar = null;
    get bar() { return this.#analysisBar.style.width.replace('%', ''); }
    set bar(percentage) { this.#analysisBar.style.width = `${percentage}%`; }

    #analysisList = null;
    get analysisList() { return this.#analysisList; }

    #analysis = null;
    get analysis() { return this.#analysis; }

    constructor(game, el) {
        this.game = game;
        this.#analysis = [];
        this.#analysisEl = el;
        this.#analysisBar = this.#analysisEl.querySelector('.bar');
        this.#analysisList = this.#analysisEl.querySelector('#analysisList');
    }

    addAnalysis(url, lichess, openingTheory) {
        this.#analysis.push({
            url: url,
            lichess: lichess,
            openingTheory: openingTheory
        });

        const li = document.createElement('li');
        const hist = this.game.history.lastHistory;
        const details = li.appendChild(document.createElement('details'));
        const summary = details.appendChild(document.createElement('summary'));

        summary.textContent = hist.black ? hist.black : hist.white;
        li.value = hist.turn;
        li.dataset.fullMove = hist.turn;
        li.dataset.color = hist.black ? black : white;

        if (lichess) {
            const line = details.appendChild(document.createElement('p'));
            line.textContent = `Word from Lichess: "${lichess.mate ?? lichess.moves}"`;
        }

        if (openingTheory) {
            const fullUrl = `https://en.wikibooks.org/wiki/${url}`;
            const html = openingTheory.extract;
            const content = details.appendChild(document.createElement('article'));

            content.insertAdjacentHTML('beforeend', html);

            content.innerHTML = [...content.childNodes]
                .filter(node => node.textContent.trim())
                .map(node => node[node.nodeName === '#text' ? 'textContent' : 'outerHTML'].trim())
                .join('')
                .replace(/(<\/*)h([1-6])/g, (_, t, l) => ((l * 1) + 1 > 6) ? `${t}b` : `${t}h${(l * 1) + 1}`)
                + `<a href="${fullUrl}" target="_blank">Continue reading</a>`;
        }

        if (details.textContent === summary.textContent) details.insertAdjacentHTML('beforeend', '<p>No evaluation available :(</p>');

        this.#analysisList.prepend(li);
    }

    parseMoves = moveString => moveString.replace(/\n|(\d+\.+)|(?<=#).*$/g, '').replace(/ +/g, '|').replace(/^\|/, '').split('|');

    runMoves(moves) {
        const pieceTypes = 'KQRBN'.split('');
        const ranks = '12345678'.split('');
        const files = 'abcdefgh'.split('');

        const getPiece = str => {
            if (pieceTypes.includes(str[0]))
                switch (str[0]) {
                    case 'K': return king;
                    case 'Q': return queen;
                    case 'R': return rook;
                    case 'B': return bishop;
                    case 'N': return knight;
                }
            return pawn;
        }

        const parsedMoves = typeof moves === 'string' ? this.parseMoves(moves) : moves;

        let count = 0;

        const hist = parsedMoves.map(move => {
            if (!this.turn) count++;

            const head = `${count}) ${this.turn ? black : white} -`;
            let ret = '';

            this.game.turn = !this.game.turn;

            if (['0-0', '0-0-0', 'O-O', 'O-O-O'].includes(move))
                return `${head} castled ${['0-0', 'O-O'].includes(move) ? 'kingside' : 'queenside'}: ${move}`;

            const parts = move.split('');
            const piece = getPiece(parts);

            const didCheck = parts.includes('+');
            const enPassant = parts.includes('.');
            const isCapture = parts.includes('x');
            const isCheckmate = parts.includes('#');
            const isPromotion = parts.includes('=');

            // not pawn:
            // piece - capture - ogFile - ogRank - file - rank - check/mate
            // pawn:
            // ogFile - ogRank - capture - file - rank - check/mate
            if (pieceTypes.includes(parts[0])) { // not pawn
                // 0 = piece type
                if (isCapture) {
                    // 1 = x
                    //if(parts.length === )
                }
                else {
                    // 1 = 
                }
            }
            else { // pawn
                // 0 = 
                if (isCapture) {
                    // 0 = og file
                    // 1 = x
                    // 2 = file
                    // 3 = rank
                }
                else {
                    // 0 = 
                    // 1 = 
                    // 2 = 
                    // 3 = 
                }
            }

            const ahhh = {
                pawn: {
                    capture: {
                        ambiguisRank: {
                            ambiguisFile: {
                                check: `{startFile}{startRank}{x}{endFile}{endRank}{+}`,
                                enps: `{startFile}{startRank}{x}{endFile}{endRank}{e.p.}`,
                                mate: `{startFile}{startRank}{x}{endFile}{endRank}{#}`,
                                prom: `{startFile}{startRank}{x}{endFile}{endRank}{=piece}`,
                                move: `{startFile}{startRank}{x}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{startFile}{x}{endFile}{endRank}{+}`,
                                enps: `{startFile}{x}{endFile}{endRank}{e.p.}`,
                                mate: `{startFile}{x}{endFile}{endRank}{#}`,
                                move: `{startFile}{x}{endFile}{endRank}`
                            }
                        },
                        unambiguisRank: {
                            ambiguisFile: {
                                check: `{startRank}{x}{endFile}{endRank}{+}`,
                                enps: `{startRank}{x}{endFile}{endRank}{e.p.}`,
                                mate: `{startRank}{x}{endFile}{endRank}{#}`,
                                prom: `{startRank}{x}{endFile}{endRank}{=piece}`,
                                move: `{startRank}{x}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{x}{endFile}{endRank}{+}`,
                                enps: `{x}{endFile}{endRank}{e.p.}`,
                                mate: `{x}{endFile}{endRank}{#}`,
                                move: `{x}{endFile}{endRank}`
                            }
                        }
                    },
                    notCapture: {
                        ambiguisRank: {
                            ambiguisFile: {
                                check: `{startFile}{startRank}{endFile}{endRank}{+}`,
                                mate: `{startFile}{startRank}{endFile}{endRank}{#}`,
                                prom: `{startFile}{startRank}{endFile}{endRank}{=piece}`,
                                move: `{startFile}{startRank}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{startFile}{endFile}{endRank}{+}`,
                                mate: `{startFile}{endFile}{endRank}{#}`,
                                prom: `{startFile}{endFile}{endRank}{=piece}`,
                                move: `{startFile}{endFile}{endRank}`
                            }
                        },
                        unambiguisRank: {
                            ambiguisFile: {
                                check: `{startFile}{endFile}{endRank}{+}`,
                                mate: `{startFile}{endFile}{endRank}{#}`,
                                prom: `{startFile}{endFile}{endRank}{=piece}`,
                                move: `{startFile}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{endFile}{endRank}{+}`,
                                mate: `{endFile}{endRank}{#}`,
                                prom: `{endFile}{endRank}{=piece}`,
                                move: `{endFile}{endRank}`
                            }
                        }
                    }
                },
                notPawn: {
                    capture: {
                        ambiguisRank: {
                            ambiguisFile: {
                                check: `{piece}{startFile}{startRank}{x}{endFile}{endRank}{+}`,
                                mate: `{piece}{startFile}{startRank}{x}{endFile}{endRank}{#}`,
                                move: `{piece}{startFile}{startRank}{x}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{piece}{startFile}{x}{endFile}{endRank}{+}`,
                                mate: `{piece}{startFile}{x}{endFile}{endRank}{#}`,
                                move: `{piece}{startFile}{x}{endFile}{endRank}`
                            }
                        },
                        unambiguisRank: {
                            ambiguisFile: {
                                check: `{piece}{startRank}{x}{endFile}{endRank}{+}`,
                                mate: `{piece}{startRank}{x}{endFile}{endRank}{#}`,
                                move: `{piece}{startRank}{x}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{piece}{x}{endFile}{endRank}{+}`,
                                mate: `{piece}{x}{endFile}{endRank}{#}`,
                                move: `{piece}{x}{endFile}{endRank}`
                            }
                        }
                    },
                    notCapture: {
                        ambiguisRank: {
                            ambiguisFile: {
                                check: `{piece}{startFile}{startRank}{endFile}{endRank}{+}`,
                                mate: `{piece}{startFile}{startRank}{endFile}{endRank}{#}`,
                                move: `{piece}{startFile}{startRank}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{piece}{startFile}{endFile}{endRank}{+}`,
                                mate: `{piece}{startFile}{endFile}{endRank}{#}`,
                                move: `{piece}{startFile}{endFile}{endRank}`
                            }
                        },
                        unambiguisRank: {
                            ambiguisFile: {
                                check: `{piece}{startRank}{endFile}{endRank}{+}`,
                                mate: `{piece}{startRank}{endFile}{endRank}{#}`,
                                move: `{piece}{startRank}{endFile}{endRank}`
                            },
                            unambiguisFile: {
                                check: `{piece}{endFile}{endRank}{+}`,
                                mate: `{piece}{endFile}{endRank}{#}`,
                                move: `{piece}{endFile}{endRank}`
                            }
                        }
                    }
                }
            }


            if (pieceTypes.includes(parts[0])) { // not a pawn move
                switch (parts.length) {
                    case 2: {
                        if (ranks.includes(parts[1])) return `${head} moved ${piece} to ${parts[1]} rank: ${move}`;
                        return `${head} moved ${piece} to ${parts[1]} file: ${move}`;
                    }
                    case 3: {
                        if (isCapture) {
                            if (files.includes(parts[1])) {
                                if (ranks.includes(parts[2]))
                                    return `${head} moved ${piece} to ${parts[1]}${parts[2]} (capture): ${move}`;
                                return `${head} moved ${piece} to ${parts[1]} rank (capture): ${move}`;
                            }

                            else if (files.includes(parts[2])) return `${head} moved ${piece} to ${parts[2]} file (capture): ${move}`;
                            return `${head} moved ${piece} (capture): ${move}`;

                        }
                        return `${head} moved ${piece}: ${move}`;
                    }
                    case 4: {
                        if (didCheck) return `${head} moved ${piece} (check): ${move}`;
                        else if (isCheckmate) return `${head} moved ${piece} (checkmate): ${move}`;
                        else if (isCapture) return `${head} moved ${piece} (capture): ${move}`;
                        return `${head} moved ${piece}: ${move}`;
                    }
                    case 5: {
                        if (isCapture && isCheckmate) return `${head} moved ${piece} (capture and checkmate): ${move}`;
                        if (isCapture && didCheck) return `${head} moved ${piece} (capture and check): ${move}`;
                        return `${head} moved ${piece}: ${move}`;
                    }
                    case 6: {
                        if (isCapture && isCheckmate) return `${head} moved ${piece} (capture and checkmate): ${move}`;
                        if (isCapture && didCheck) return `${head} moved ${piece} (capture and check): ${move}`;
                        if (isCapture) return `${head} moved ${piece} (capture): ${move}`;
                    }
                }
            }

            else { // pawn move
                switch (parts.length) {
                    case 2: {
                        if (isCheckmate) return `${head} moved Pawn (checkmate): ${move}`;
                        if (didCheck) return `${head} moved Pawn (check): ${move}`;
                        if (isCapture) return `${head} moved Pawn (capture): ${move}`;
                        if (enPassant) return `${head} moved Pawn (E N P A S S A N T): ${move}`;
                        return `${head} moved Pawn: ${move}`;
                    }
                    case 3: {
                        if (isCheckmate) return `${head} moved Pawn (checkmate): ${move}`;
                        if (didCheck) return `${head} moved Pawn (check): ${move}`;
                        if (isCapture) return `${head} moved Pawn (capture): ${move}`;
                        if (enPassant) return `${head} moved Pawn (E N P A S S A N T): ${move}`;
                        return `${head} moved Pawn: ${move}`;
                    }
                    case 4: {
                        if (isCheckmate) return `${head} moved Pawn (checkmate): ${move}`;
                        if (didCheck) return `${head} moved Pawn (check): ${move}`;
                        if (isCapture) return `${head} moved Pawn (capture): ${move}`;
                        if (enPassant) return `${head} moved Pawn (E N P A S S A N T): ${move}`;
                        return `${head} moved Pawn: ${move}`;
                    }
                    case 5: {
                        if (isCheckmate) return `${head} moved Pawn (checkmate): ${move}`;
                        if (didCheck) return `${head} moved Pawn (check): ${move}`;
                        if (isCapture) return `${head} moved Pawn (capture): ${move}`;
                        if (enPassant) return `${head} moved Pawn (E N P A S S A N T): ${move}`;
                        return `${head} moved Pawn: ${move}`;
                    }
                    case 6: {
                        if (isCheckmate) return `${head} moved Pawn (checkmate): ${move}`;
                        if (didCheck) return `${head} moved Pawn (check): ${move}`;
                        if (isCapture) return `${head} moved Pawn (capture): ${move}`;
                        if (enPassant) return `${head} moved Pawn (E N P A S S A N T): ${move}`;
                        return `${head} moved Pawn: ${move}`;
                    }
                }
            }

            return `${head} UNKNOWN MOVE: ${move}`;
        });

        console.log(hist.join('\n'));
    }
}
