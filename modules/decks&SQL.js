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

                    con.query("INSERT INTO decks (name, owner, public, list, lastUpdated, whoModifiedLast) VALUES (\'" +
                            deckName + "\',\'" +
                            username + "\',\'" +
                            bool + "\',\'" +
                            deckListString + "\',\'" +
                            hour + "\',\'" +
                            username + "\')"
                        , (err) => {
                            if (err) {
                                throw err;
                            } else {
                                res.json({message: 'Deck saved'});
                            }
                        });
                } else {
                    res.json({message: 'You already own a deck named like that'});
                }
            }
        })
}

module.exports.getUserDecks = function (username, con, res) {
    con.query('SELECT name, lastUpdated, whoModifiedLast FROM decks WHERE owner = ?', [username], (err, result) => {
        if (err) {
            throw err;
        } else {
            console.log('retour sql : ', result);
            const tab = [];
            for (const line of result) {
                tab.push({name: line.name, lastUpdated: line.lastUpdated, who: line.whoModifiedLast});
            }
            console.log('on envoie : ', tab);
            res.json({list: tab});
        }
    });
}

module.exports.deleteDeck = function (username, deckName, con, res) {
    con.query('DELETE FROM decks WHERE owner = ? AND name = ?', [username, deckName], (e)=> {
        if(e){
            throw e;
        }else{
            res.json({output: 'Deck deleted'});
        }
    });
}