const hourModule = require('./shared/getHour');

module.exports.uploadDeck = function (deckName, username, deckList, forEveryone, con, res) {
    con.query('SELECT name FROM decks WHERE name = ? AND owner = ?',
        [deckName, username], (e, r) => { //checking si un deck de username porte déjà le même nom
            if (e) {
                throw e;
            } else {
                if (!r.length) { //si non on enregistre tout ça
                    const hour = hourModule.getHour();
                    const deckListString = JSON.stringify(deckList);
                    let bool = 0;
                    if(forEveryone){
                        bool = 1;
                    }
                    const sql = `INSERT INTO decks (name, owner, public, list, lastUpdated, whoModifiedLast) VALUES (?,?,?,?,?,?)`;
                    con.query(sql, [deckName, username, bool, deckListString, hour, username], (err) => {
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
        })
}

module.exports.getUserDecks = function (username, con, res) {
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
}

module.exports.deleteDeck = function (username, deckName, con, res) {
    con.query('DELETE FROM decks WHERE owner = ? AND name = ?', [username, deckName], (e) => {
        if(e){
            throw e;
        }else{
            return res.json({output: deckName + ' deleted'});
        }
    });
}

// module.exports.getListSharedWith = function (deck, username, con, res){
//     con.query('SELECT sharedWith FROM decks WHERE name = ? AND owner = ?', (deck, username), (e,r) => {
//         if(e){
//             throw e;
//         }else{
//             console.log(r);
//             // let tab = [];
//             // for(const line of r){
//             //     tab.push({username:line[0].username})
//             // }
//             res.json({output: tab});
//         }
//     })
// }

module.exports.shareWith = function (deck, user, sharingWith, con, res){
    con.query('SELECT sharedWith FROM decks WHERE name = ? AND owner = ?', [deck, user], (e,r) => {
        if(e){
            throw e;
        }else{
            let tab = [];
            if(r[0].sharedWith===null){
                tab = [sharingWith];
            }else{
                tab = JSON.parse(r[0].sharedWith);
                for(const line of tab){
                    if(line===sharingWith){
                        return res.json({output:'Already shared with '+sharingWith});
                    }
                }
                tab.push(sharingWith);
            }
                const listSharing = JSON.stringify(tab);
                con.query('UPDATE decks SET sharedWith = ? WHERE name = ? AND owner = ?', [listSharing, deck, user], (err) => {
                    if (err) {
                        throw err;
                    } else {
                        return res.json({output: 'Deck shared with ' + sharingWith});
                    }
                });
        }
    });
}