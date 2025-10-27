// Big Two Game Logic - Server Side

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    getValue() {
        const values = {
            '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15
        };
        return values[this.rank];
    }

    getSuitValue() {
        const suitValues = { '♦': 1, '♣': 2, '♥': 3, '♠': 4 };
        return suitValues[this.suit];
    }

    getCompareValue() {
        return this.getValue() * 10 + this.getSuitValue();
    }
}

class GameLogic {
    static createDeck() {
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
        const deck = [];

        for (const suit of suits) {
            for (const rank of ranks) {
                deck.push({ suit, rank });
            }
        }

        // Fisher-Yates shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        return deck;
    }

    static dealCards(findFirstPlayer = true) {
        const deck = this.createDeck();
        const hands = [[], [], [], []];
        
        for (let i = 0; i < 52; i++) {
            hands[i % 4].push(deck[i]);
        }

        // Sort each player's hand
        for (let i = 0; i < 4; i++) {
            hands[i].sort((a, b) => {
                const cardA = new Card(a.suit, a.rank);
                const cardB = new Card(b.suit, b.rank);
                return cardA.getCompareValue() - cardB.getCompareValue();
            });
        }

        let startPlayer = 0;
        
        // Find player with 3♦ to start
        if (findFirstPlayer) {
            for (let p = 0; p < 4; p++) {
                for (const card of hands[p]) {
                    if (card.rank === '3' && card.suit === '♦') {
                        startPlayer = p;
                        break;
                    }
                }
            }
        }

        return { hands, startPlayer };
    }

    static getCombinationType(cards) {
        if (!cards || cards.length === 0) return null;
        
        const sortedCards = [...cards].map(c => new Card(c.suit, c.rank))
            .sort((a, b) => a.getValue() - b.getValue());
        
        if (cards.length === 1) {
            return { type: 'single', strength: sortedCards[0].getCompareValue() };
        }
        
        if (cards.length === 2) {
            if (sortedCards[0].getValue() === sortedCards[1].getValue()) {
                return { type: 'pair', strength: sortedCards[1].getCompareValue() };
            }
            return null;
        }
        
        if (cards.length === 3) {
            if (sortedCards[0].getValue() === sortedCards[1].getValue() && 
                sortedCards[1].getValue() === sortedCards[2].getValue()) {
                return { type: 'triple', strength: sortedCards[2].getCompareValue() };
            }
            return null;
        }
        
        if (cards.length === 5) {
            return this.getFiveCardType(sortedCards);
        }
        
        return null;
    }

    static getFiveCardType(sortedCards) {
        const values = sortedCards.map(card => card.getValue());
        const suits = sortedCards.map(card => card.suit);
        const valueCounts = {};
        
        for (const value of values) {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        }
        
        const counts = Object.values(valueCounts).sort((a, b) => b - a);
        const isFlush = suits.every(suit => suit === suits[0]);
        
        let isStraight = false;
        let straightHigh = 0;
        
        const valueStr = values.join(',');
        
        if (valueStr === '3,4,5,14,15') {
            isStraight = true;
            straightHigh = 5;
        } else if (valueStr === '10,11,12,13,14') {
            isStraight = true;
            straightHigh = 14;
        } else if (values[4] - values[0] === 4 && new Set(values).size === 5) {
            isStraight = true;
            straightHigh = values[4];
        }
        
        if (isStraight && isFlush) {
            return { type: 'straight-flush', strength: straightHigh * 10 + sortedCards[4].getSuitValue(), rank: 5 };
        }
        
        if (counts[0] === 4) {
            const fourValue = Object.keys(valueCounts).find(k => valueCounts[k] === 4);
            return { type: 'four-kind', strength: fourValue * 10, rank: 4 };
        }
        
        if (counts[0] === 3 && counts[1] === 2) {
            const threeValue = Object.keys(valueCounts).find(k => valueCounts[k] === 3);
            return { type: 'full-house', strength: threeValue * 10, rank: 3 };
        }
        
        if (isFlush) {
            return { type: 'flush', strength: sortedCards[4].getCompareValue(), rank: 2 };
        }
        
        if (isStraight) {
            return { type: 'straight', strength: straightHigh * 10 + sortedCards[4].getSuitValue(), rank: 1 };
        }
        
        return null;
    }

    static isValidPlay(cards, lastPlay, lastPlayType, isFirstPlay, gameStarted) {
        if (!cards || cards.length === 0) return false;
        
        const playType = this.getCombinationType(cards);
        if (!playType) return false;

        // First play must include 3♦
        if (isFirstPlay && !gameStarted) {
            return cards.some(card => card.rank === '3' && card.suit === '♦');
        }

        if (!lastPlay) return true;

        // Must be same LENGTH
        if (cards.length !== lastPlay.length) {
            return false;
        }

        // For 5-card hands, must be same TYPE or higher rank type
        if (cards.length === 5) {
            if (playType.type === lastPlayType.type) {
                return playType.strength > lastPlayType.strength;
            }
            return playType.rank > lastPlayType.rank;
        }

        // For non-5-card hands, must match exact type
        if (lastPlayType.type !== playType.type) {
            return false;
        }

        return playType.strength > lastPlayType.strength;
    }

    static calculateRoundScores(players, winnerIndex) {
        const scores = [0, 0, 0, 0];
        
        for (let p = 0; p < 4; p++) {
            if (p !== winnerIndex && players[p]) {
                const cardsLeft = players[p].hand ? players[p].hand.length : 0;
                let points;
                if (cardsLeft <= 4) {
                    points = cardsLeft;
                } else if (cardsLeft <= 9) {
                    points = cardsLeft * 2;
                } else {
                    points = cardsLeft * 3;
                }
                scores[p] = points;
            }
        }

        return scores;
    }

    // AI Logic
    static getAIPlay(hand, lastPlay, lastPlayType) {
        if (!hand || hand.length === 0) return null;

        // If starting new trick, AI prefers to play lowest cards
        if (!lastPlay) {
            const pairs = this.findAllPairs(hand);
            if (pairs.length > 0) return pairs[0];
            return [hand[0]];
        }

        // Try to beat the last play
        const validPlays = this.findValidPlays(hand, lastPlayType);
        if (validPlays.length === 0) return null;

        // Play lowest valid combo
        return validPlays[0];
    }

    static findValidPlays(hand, lastPlayType) {
        const validPlays = [];
        
        if (lastPlayType.type === 'single') {
            for (const card of hand) {
                const cardObj = new Card(card.suit, card.rank);
                if (cardObj.getCompareValue() > lastPlayType.strength) {
                    validPlays.push([card]);
                }
            }
        } else if (lastPlayType.type === 'pair') {
            const pairs = this.findAllPairs(hand);
            for (const pair of pairs) {
                const pairType = this.getCombinationType(pair);
                if (pairType && pairType.strength > lastPlayType.strength) {
                    validPlays.push(pair);
                }
            }
        } else if (lastPlayType.type === 'triple') {
            const triples = this.findAllTriples(hand);
            for (const triple of triples) {
                const tripleType = this.getCombinationType(triple);
                if (tripleType && tripleType.strength > lastPlayType.strength) {
                    validPlays.push(triple);
                }
            }
        } else if (lastPlayType.type.includes('-') || ['straight', 'flush', 'full-house', 'four-kind', 'straight-flush'].includes(lastPlayType.type)) {
            const fiveCards = this.findAllFiveCardCombos(hand);
            for (const combo of fiveCards) {
                if (this.isValidPlay(combo, hand, lastPlayType, false, true)) {
                    validPlays.push(combo);
                }
            }
        }

        return validPlays;
    }

    static findAllPairs(hand) {
        const pairs = [];
        for (let i = 0; i < hand.length - 1; i++) {
            for (let j = i + 1; j < hand.length; j++) {
                const cardI = new Card(hand[i].suit, hand[i].rank);
                const cardJ = new Card(hand[j].suit, hand[j].rank);
                if (cardI.getValue() === cardJ.getValue()) {
                    pairs.push([hand[i], hand[j]]);
                }
            }
        }
        return pairs;
    }

    static findAllTriples(hand) {
        const triples = [];
        for (let i = 0; i < hand.length - 2; i++) {
            for (let j = i + 1; j < hand.length - 1; j++) {
                for (let k = j + 1; k < hand.length; k++) {
                    const cardI = new Card(hand[i].suit, hand[i].rank);
                    const cardJ = new Card(hand[j].suit, hand[j].rank);
                    const cardK = new Card(hand[k].suit, hand[k].rank);
                    if (cardI.getValue() === cardJ.getValue() && 
                        cardJ.getValue() === cardK.getValue()) {
                        triples.push([hand[i], hand[j], hand[k]]);
                    }
                }
            }
        }
        return triples;
    }

    static findAllFiveCardCombos(hand) {
        const combos = [];
        if (hand.length < 5) return combos;
        
        // Simplified - just check a few combinations
        for (let i = 0; i < Math.min(hand.length - 4, 5); i++) {
            const combo = hand.slice(i, i + 5);
            if (this.getCombinationType(combo)) {
                combos.push(combo);
            }
        }
        return combos;
    }
}

module.exports = GameLogic;
