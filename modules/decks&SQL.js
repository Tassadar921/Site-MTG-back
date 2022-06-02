const hourModule = require('./shared/getHour');

module.exports.uploadDeck = function (deckName, username, deckList, forEveryone, colors, con, res) {
    con.query('SELECT name FROM decks WHERE name = ? AND owner = ?',
        [deckName, username], (e, r) => { //checking si un deck de username porte déjà le même nom
            if (e) {
                throw e;
            } else {
                if (!r.length) { //si non on enregistre tout ça
                    const hour = hourModule.getHour();
                    const deckListString = JSON.stringify(deckList);
                    const bool = Number(forEveryone);
                    const sql = `INSERT INTO decks (
                            name,
                            owner,
                            public,
                            list,
                            lastUpdated,
                            whoModifiedLast,
                            white,
                            blue,
                            black,
                            red,
                            green,
                            colorless
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
                    con.query(sql, [
                        deckName,
                        username,
                        bool,
                        deckListString,
                        hour,
                        username,
                        colors.white,
                        colors.blue,
                        colors.black,
                        colors.red,
                        colors.green,
                        colors.colorless
                    ], (err) => {
                        if (err) {
                            throw err;
                        } else {
                            return res.json({message: 'Deck saved'});
                        }
                    });
                } else { //sinon on signale à l'utilisateur qu'il a déjà un deck nommé comme ça
                    return res.json({message: 'You already own a deck named like that'});
                }
            }
        });
};

module.exports.getUserDecks = function (username, platform, con, res) {
    if(platform==='small') {
        con.query('SELECT name, lastUpdated, whoModifiedLast FROM decks WHERE owner = ? ORDER BY name', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                const tab = [];
                for (const line of result) {
                    tab.push({name: line.name, lastUpdated: line.lastUpdated, who: line.whoModifiedLast});
                }
                return res.json({list: tab});
            }
        });
    }else if(platform==='large'){
        con.query('SELECT name, lastUpdated, whoModifiedLast, white, blue, black, red, green, colorless FROM decks WHERE owner = ? ORDER BY name', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                const tab = [];
                for (const line of result) {
                    tab.push({
                        name: line.name,
                        lastUpdated: line.lastUpdated,
                        who: line.whoModifiedLast,
                        white: line.white,
                        blue: line.blue,
                        black: line.black,
                        red: line.red,
                        green: line.green,
                        colorless: line.colorless
                    });
                }
                return res.json({list: tab});
            }
        });
    }
};

module.exports.deleteDeck = function (username, deckName, con, res) {
    con.query('DELETE FROM decks WHERE owner = ? AND name = ?', [username, deckName], (e) => {
        if (e) {
            throw e;
        } else {
            return res.json({output: deckName + ' deleted'});
        }
    });
};

module.exports.getListSharedWith = function (deck, username, con, res) {
    con.query('SELECT sharedWith FROM decks WHERE name = ? AND owner = ?', [deck, username], (e, r) => {
        if (e) {
            throw e;
        } else {
            return res.json({output: r[0].sharedWith});
        }
    });
};

module.exports.shareWith = function (deck, user, sharingWithList, con, res) {
    con.query('UPDATE decks SET sharedWith = ? WHERE name = ? AND owner = ?', [sharingWithList, deck, user], (err) => {
        if (err) {
            throw err;
        } else {
            return res.json({output: 'Deck sharing list updated'});
        }
    });
};

module.exports.getDeckListSharedWith = function (username, platform, con, res) {
    username = ' ' + username + ' ';
    if(platform==='small') {
        con.query('SELECT name, owner, lastUpdated, whoModifiedLast FROM decks WHERE sharedWith in (?) > 0', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                let tab = [];
                for (const line of result) {
                    tab.push({
                        deckName: line.name,
                        owner: line.owner,
                        lastUpdated: line.lastUpdated,
                        whoModifiedLast: line.whoModifiedLast
                    });
                }
                res.json({output: tab});
            }
        });
    }else if(platform==='large'){
        con.query('SELECT name, lastUpdated, whoModifiedLast, owner, white, blue, black, red, green, colorless FROM decks WHERE sharedWith in (?) > 0', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                let tab = [];
                for (const line of result) {
                    tab.push({
                        deckName: line.name,
                        owner: line.owner,
                        lastUpdated: line.lastUpdated,
                        whoModifiedLast: line.whoModifiedLast,
                        white: line.white,
                        blue: line.blue,
                        black: line.black,
                        red: line.red,
                        green: line.green,
                        colorless: line.colorless
                    });
                }
                res.json({output: tab});
            }
        });
    }
};

module.exports.getVisibleDecks = function (username, platform, con, res){
    if(platform==='small'){

    }
}