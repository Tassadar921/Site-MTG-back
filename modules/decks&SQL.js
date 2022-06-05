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
                            colorless,
                            id
                        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
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
                        colors.colorless,
                        username+deckName
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
        con.query('SELECT name, lastUpdated, whoModifiedLast, id FROM decks WHERE owner = ? ORDER BY name', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                const tab = [];
                for (const line of result) {
                    tab.push({
                        deckName: line.name,
                        lastUpdated: line.lastUpdated,
                        whoModifiedLast: line.whoModifiedLast,
                        id: line.id
                    });
                }
                return res.json({list: tab});
            }
        });
    }else if(platform==='large'){
        con.query('SELECT name, lastUpdated, whoModifiedLast, white, blue, black, red, green, colorless, id FROM decks WHERE owner = ? ORDER BY name', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                const tab = [];
                for (const line of result) {
                    tab.push({
                        deckName: line.name,
                        lastUpdated: line.lastUpdated,
                        whoModifiedLast: line.whoModifiedLast,
                        white: line.white,
                        blue: line.blue,
                        black: line.black,
                        red: line.red,
                        green: line.green,
                        colorless: line.colorless,
                        id: line.id,
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

module.exports.getListSharedWith = function (deckId, con, res) {
    con.query('SELECT sharedWith FROM decks WHERE id = ?', [deckId], (e, r) => {
        if (e) {
            throw e;
        } else {
            if(r.length) {
                return res.json({output: r[0].sharedWith});
            }else{
                return res.json({output: ' '});
            }
        }
    });
};

module.exports.shareWith = function (deckId, sharingWithList, nickname, con, res) {
    con.query('UPDATE decks SET sharedWith = ? WHERE id = ? AND owner = ?', [sharingWithList, deckId, nickname], (err) => {
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
        con.query('SELECT name, owner, lastUpdated, whoModifiedLast, id FROM decks WHERE sharedWith in (?) > 0', [username], (err, result) => {
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
                        id: line.id
                    });
                }
                res.json({output: tab});
            }
        });
    }else if(platform==='large'){
        con.query('SELECT name, lastUpdated, whoModifiedLast, owner, white, blue, black, red, green, colorless, id FROM decks WHERE sharedWith in (?) > 0', [username], (err, result) => {
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
                        colorless: line.colorless,
                        id: line.id
                    });
                }
                res.json({output: tab});
            }
        });
    }
};

module.exports.getVisibleDecks = function (username, platform, con, res){
    const user = ' '+username+' ';
    if(platform==='small') {
        con.query('SELECT name, lastUpdated, whoModifiedLast, owner, id FROM decks WHERE owner = ? ORDER BY name', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                const tab = [];
                for (const line of result) {
                    tab.push({
                        deckName: line.name,
                        lastUpdated: line.lastUpdated,
                        whoModifiedLast: line.whoModifiedLast,
                        owner: line.owner,
                        right: 'edit',
                        id: line.id,
                    });
                }
                con.query('SELECT name, lastUpdated, whoModifiedLast, owner, id FROM decks WHERE INSTR(sharedWith , ?) > 0 ORDER BY name', [user], (e, r) => {
                    if(e){
                        throw e;
                    }else{
                        for (const line of r) {
                            tab.push({
                                deckName: line.name,
                                lastUpdated: line.lastUpdated,
                                whoModifiedLast: line.whoModifiedLast,
                                owner: line.owner,
                                right: 'edit',
                                id: line.id,
                            });
                        }
                        con.query('SELECT name, lastUpdated, whoModifiedLast, owner, id FROM decks WHERE (NOT INSTR(sharedWith , ?) > 0) AND (owner <> ?) AND (public = 1) ORDER BY name', [user, username], (er,re) => {
                            if(er){
                                throw er;
                            }else{
                                for (const line of re) {
                                    tab.push({
                                        deckName: line.name,
                                        lastUpdated: line.lastUpdated,
                                        whoModifiedLast: line.whoModifiedLast,
                                        owner: line.owner,
                                        right: 'look',
                                        id: line.id,
                                    });
                                }
                                return res.json({output: tab});
                            }
                        });
                    }
                });
            }
        });
    }else if(platform==='large'){
        con.query('SELECT name, lastUpdated, whoModifiedLast, owner, white, blue, black, red, green, colorless, id FROM decks WHERE owner = ? ORDER BY name', [username], (err, result) => {
            if (err) {
                throw err;
            } else {
                const tab = [];
                for (const line of result) {
                    tab.push({
                        deckName: line.name,
                        lastUpdated: line.lastUpdated,
                        whoModifiedLast: line.whoModifiedLast,
                        white: line.white,
                        blue: line.blue,
                        black: line.black,
                        red: line.red,
                        green: line.green,
                        colorless: line.colorless,
                        owner: line.owner,
                        right: 'edit',
                        id: line.id,
                    });
                }
                con.query('SELECT name, lastUpdated, whoModifiedLast, owner, white, blue, black, red, green, colorless, id FROM decks WHERE INSTR(sharedWith , ?) > 0 ORDER BY name', [user], (e, r) => {
                    if(e){
                        throw e;
                    }else{
                        for (const line of r) {
                            tab.push({
                                deckName: line.name,
                                lastUpdated: line.lastUpdated,
                                whoModifiedLast: line.whoModifiedLast,
                                white: line.white,
                                blue: line.blue,
                                black: line.black,
                                red: line.red,
                                green: line.green,
                                colorless: line.colorless,
                                owner: line.owner,
                                right: 'edit',
                                id: line.id,
                            });
                        }
                        con.query('SELECT name, lastUpdated, whoModifiedLast, owner, white, blue, black, red, green, colorless, id FROM decks WHERE (NOT INSTR(sharedWith , ?) > 0) AND (owner <> ?) AND (public = 1) ORDER BY name', [user, username], (er,re) => {
                            if(er){
                                throw er;
                            }else{
                                for (const line of re) {
                                    tab.push({
                                        deckName: line.name,
                                        lastUpdated: line.lastUpdated,
                                        whoModifiedLast: line.whoModifiedLast,
                                        white: line.white,
                                        blue: line.blue,
                                        black: line.black,
                                        red: line.red,
                                        green: line.green,
                                        colorless: line.colorless,
                                        owner: line.owner,
                                        right: 'look',
                                        id: line.id,
                                    });
                                }
                                return res.json({output: tab});
                            }
                        });
                    }
                });
            }
        });
    }
};

module.exports.getDeck = function (username, id, con, res){
   con.query('SELECT * FROM decks WHERE id = ?', [id], (e, r) => {
       if(e){
           throw e;
       }else {
           if(r.length) {
               let rightLevel = 0;
               if (r[0].sharedWith.includes(' ' + username + ' ') || r[0].owner === username) {
                   rightLevel = 1;
               }
               return res.json({
                   output: {
                       deckName: r[0].name,
                       owner: r[0].owner,
                       lastUpdated: r[0].lastUpdated,
                       list: JSON.parse(r[0].list),
                       whoModifiedLast: r[0].whoModifiedLast,
                       white: r[0].white,
                       blue: r[0].blue,
                       black: r[0].black,
                       red: r[0].red,
                       green: r[0].green,
                       colorless: r[0].colorless,
                       canModify: rightLevel,
                       commander: r[0].commander,
                       status: 1
                   }
               });
           }else{
               res.json({output:{status:0}});
           }
       }
   });
};