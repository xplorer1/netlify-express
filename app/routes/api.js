const express = require('express');
const app = express();
const apirouter = express.Router();
const User = require("../models/user");
const BucketList = require("../models/bucketlist");
const config = require('../../config');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const supersecret = config.secret;
const storage = require('node-persist');
const appstorage = require("../nodepersist");
const middlewares = require("../middleware");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');

if(!appstorage.get("blacklist")) {
    appstorage.set("blacklist", []);
}

apirouter.use(function(req, res, next) {
    console.log(req.method, req.url);
    next(); 
});

apirouter.use('/api-docs', swaggerUi.serve);
apirouter.get('/api-docs', swaggerUi.setup(swaggerDocument));

apirouter.post('/auth/save', Save);
apirouter.post('/auth/login', Login);
apirouter.get('/auth/logout', middlewares.checkToken, Logout);
apirouter.post('/bucketlists', middlewares.checkToken, CreateList);
apirouter.get('/bucketlists', middlewares.checkToken, Lists);
apirouter.get('/bucketlists/:id', middlewares.checkToken, List);
apirouter.put('/bucketlists/:id', middlewares.checkToken, UpdateList);
apirouter.delete('/bucketlists/:id', middlewares.checkToken, DeleteList);
apirouter.post('/bucketlists/:id/items', middlewares.checkToken, CreateListItem);
apirouter.get('/bucketlists/:id/items', middlewares.checkToken, ListItems);
apirouter.get('/bucketlists/:id/items/:item_id', middlewares.checkToken, ListItem);
apirouter.put('/bucketlists/:id/items/:item_id', middlewares.checkToken, UpdateListItem);
apirouter.delete('/bucketlists/:id/items/:item_id', middlewares.checkToken, DeleteListItem);
apirouter.use(function(req, res) {
    return res.status(404).send({ message: 'The url you visited does not exist' });
});

function Save(req, res) {
    const text = 'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *';
    const values = [req.body.name, req.body.email, req.body.password];

    db.query(text, values, (err, user) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
          //return next(err)
        }

        if(user.rowCount > 0) {
            return res.status(200).send(user.rows[0]);
        }
    })
}

function Login(req, res) {
	if(!req.body.email) return res.status(499).send({data: "email-required"});
    if(!req.body.password) return res.status(499).send({data: "password-required"});

    let text = 'SELECT * FROM users WHERE users.email = $1 AND users.password = $2';
    let values = [req.body.email, req.body.password];

    db.query(text, values, (err, user) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(user.rowCount > 0) {
            let token = jwt.sign({
                email: req.body.email,
                name: user.rows[0].name,
                id: user.rows[0].id
            }, supersecret, {
                expiresIn: "1h" // expires in 24 hours.
            });

            let owner = {};
            owner.token = token;

            return res.status(200).send(owner);
        }
        else {
            return res.status(404).send({data: "account-not-found"});
        }
    })
}

function Logout(req, res) {
    let blacklistarray = appstorage.get("blacklist");

    blacklistarray.push(req.verified.token);
    appstorage.set("blacklist", blacklistarray);

    return res.status(200).send({data: "logout-successful"});
}

function CreateList(req, res) {
    if(!req.body.name) return res.status(404).send({data: "bucketlist-name-required"});

    let date_created = new Date();
    let date_modified = new Date();

    let text = 'INSERT INTO bucketlists(name, date_created, date_modified, created_by) VALUES($1, $2, $3, $4) RETURNING *';
    let values = [req.body.name, date_created, date_modified, req.verified.id];

    db.query(text, values, (err, list) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(list.rowCount > 0) {
            
            return res.status(200).send(list.rows[0]);
        }
        else {
            return res.status(499).send({data: "unable-to-create-bucket-list"});
        }
    })
}

function Lists(req, res) {
    let text = 'SELECT * FROM bucketlists WHERE created_by = $1';
    let value = [req.verified.id];

    if(Object.entries(req.query).length === 0 && req.query.constructor === Object) { //good old fashion fetch all bucket lists if no request queries are supplied.
        db.query(text, value, (err, lists) => {
            if (err) {
                console.log("error: ", err);
                return res.send(err)
            }

            if(lists.rowCount > 0) {
                return res.status(200).send(lists.rows);
            }
            else {
                return res.status(404).send({data: "list-notfound"});
            }
        })
    }
    else if(req.query.limit) { //when it was a limit supplied.
        if(req.query.limit >= 20 && req.query.limit <= 100) {
            let text = 'SELECT * FROM bucketlists WHERE created_by = $1 ORDER BY bucketlists.id LIMIT $2';
            let value = [req.verified.id, req.query.limit];

            db.query(text, value, (err, lists) => {
                if (err) {
                    console.log("error: ", err);
                    return res.send(err)
                }

                if(lists.rowCount > 0) {
                    return res.status(200).send(lists.rows);
                }
                else {
                    return res.status(404).send({data: "list-not-found"});
                }
            })
        }
        else {
            return res.status(200).send({data: "limit-request-out-of-range"});
        }
    }
    else if(req.query.q) {
        let text = 'SELECT * FROM bucketlists WHERE created_by = $1 AND name = $2';
        let value = [req.verified.id, req.query.q];

        db.query(text, value, (err, lists) => {
            if (err) {
                console.log("error: ", err);
                return res.send(err)
            }

            if(lists.rowCount > 0) {
                return res.status(200).send(lists.rows);
            }
            else {
                return res.status(404).send({data: "list-not-found"});
            }
        })
    }
}

function List(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let text = 'SELECT * FROM bucketlists WHERE created_by = $1 AND id = $2';
    let value = [req.verified.id, req.params.id];

    db.query(text, value, (err, list) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(list.rowCount > 0) {
            return res.status(200).send(list.rows);
        }
        else {
            return res.status(404).send({data: "list-notfound"});
        }
    });
}

function UpdateList(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let date_modified = new Date();

    if(req.body.name){
        let text = 'UPDATE bucketlists SET name = $1, date_modified = $2 WHERE id = $3 RETURNING *';
        let values = [req.body.name, date_modified, req.params.id];

        db.query(text, values, (err, updated) => {
            if (err) {
                console.log("error: ", err);
                return res.send(err)
            }

            if(updated.rowCount > 0) {
                return res.status(200).send(updated.rows);
            }
            else {
                return res.status(404).send({data: "id-notfound"});
            }
        })
    }
    else {
        return res.status(200).send({data: "nothing-to-update"});
    }
}

function DeleteList(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let text = 'DELETE FROM bucketlists WHERE id = $1 RETURNING *';
    let values = [req.params.id];

    db.query(text, values, (err, deleted) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(deleted.rowCount > 0) {
            return res.status(200).send({data: "deleted"});
        }
        else {
            return res.status(404).send({data: "id-notfound"});
        }
    })
}

function CreateListItem(req, res) {
    if(!req.body.name) return res.status(404).send({data: "item-name-required"});
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let date_created = new Date();
    let date_modified = new Date();

    let text = 'INSERT INTO items(name, date_created, date_modified, id) VALUES($1, $2, $3, $4) RETURNING *';
    let values = [req.body.name, date_created, date_modified, req.params.id];

    db.query('SELECT * FROM bucketlists WHERE bucketlists.id = $1', [req.params.id], (err, blist) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(blist.rowCount > 0) {
            db.query(text, values, (err, list) => {
                if (err) {
                    console.log("error: ", err);
                    return res.send(err)
                }

                if(list.rowCount > 0) {
                    
                    return res.status(200).send(list.rows[0]);
                }
                else {
                    return res.status(404).send({data: "id-not-found"});
                }
            })
        }
        else {
            return res.status(404).send({data: "id-not-found"});
        }
    })
}

function ListItems(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let text = 'SELECT * FROM items WHERE items.id = $1';
    let value = [req.params.id];

    db.query(text, value, (err, items) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(items.rowCount > 0) {
            return res.status(200).send(items.rows);
        }
        else {
            return res.status(404).send({data: "items-not-found"});
        }
    });
}

function ListItem(req, res) {
    if(!req.params.id) return res.status(404).send({data: "bucket-list-id-required"});
    if(!req.params.item_id) return res.status(404).send({data: "item-id-required"});

    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let text = 'SELECT * FROM items WHERE id = $1 AND item_id = $2';
    let value = [req.params.id, req.params.item_id];

    db.query(text, value, (err, item) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(item.rowCount > 0) {
            return res.status(200).send(item.rows);
        }
        else {
            return res.status(404).send({data: "item-notfound"});
        }
    });
}

function UpdateListItem(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});
    if(!req.params.item_id) return res.status(404).send({data: "id-required"});

    let date_modified = new Date();

    if(req.body.name) {
        let text = 'UPDATE items SET name = $1, date_modified = $2, done = $3 WHERE id = $4 AND item_id = $5 RETURNING *';
        let values = [req.body.name, date_modified, req.body.done, req.params.id, req.params.item_id];

        db.query(text, values, (err, updated) => {
            if (err) {
                console.log("error: ", err);
                return res.send(err)
            }

            if(updated.rowCount > 0) {
                return res.status(200).send(updated.rows);
            }
            else {
                return res.status(404).send({data: "id-notfound"});
            }
        })
    }
    else {
        return res.status(200).send({data: "nothing-to-update"});
    }
}

function DeleteListItem(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});
    if(!req.params.item_id) return res.status(404).send({data: "item_id-required"});

    let text = 'DELETE FROM items WHERE id = $1 AND item_id = $2 RETURNING *';
    let values = [req.params.id, req.params.item_id];

    db.query(text, values, (err, deleted) => {
        if (err) {
            console.log("error: ", err);
            return res.send(err)
        }

        if(deleted.rowCount > 0) {
            return res.status(200).send({data: "deleted"});
        }
        else {
            return res.status(404).send({data: "id-notfound"});
        }
    })
}

module.exports = apirouter;