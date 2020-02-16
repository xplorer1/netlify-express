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

/*const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');*/

if(!appstorage.get("blacklist")) {
    appstorage.set("blacklist", []);
}

apirouter.use(function(req, res, next) {
    console.log(req.method, req.url);
    next(); 
});

/*apirouter.use('/api-docs', swaggerUi.serve);
apirouter.get('/api-docs', swaggerUi.setup(swaggerDocument));*/

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
    if(!req.body.name) return res.send({status: 404, data: "name-reqired"});
    if(!req.body.email) return res.send({status: 404, data: "email-required"});
    if(!req.body.password) return res.send({status: 404, data: "password-required"});
    
    const text = 'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *';
    const values = [req.body.name, req.body.email, req.body.password];

    db.query(text, values, (err, user) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err});
        }

        if(user.rowCount > 0) {
            return res.send({status: 200, data: user.rows[0]});
        }
    })
}

function Login(req, res) {
	if(!req.body.email) return res.send({status: 404, data: "email-required"});
    if(!req.body.password) return res.send({status: 404, data: "password-required"});

    let text = 'SELECT * FROM users WHERE users.email = $1 AND users.password = $2';
    let values = [req.body.email, req.body.password];

    db.query(text, values, (err, user) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err});
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

            return res.send({status: 200, data: owner});
        }
        else {
            return res.send({status: 404, data: "not-found"});
        }
    })
}

function Logout(req, res) {
    let blacklistarray = appstorage.get("blacklist");

    blacklistarray.push(req.verified.token);
    appstorage.set("blacklist", blacklistarray);

    return res.send({status: 200});
}

function CreateList(req, res) {
    if(!req.body.name) return res.send({status: 404, data: "bucketlist-name-required"});

    let date_created = new Date();
    let date_modified = new Date();

    let text = 'INSERT INTO bucketlists(name, date_created, date_modified, created_by) VALUES($1, $2, $3, $4) RETURNING *';
    let values = [req.body.name, date_created, date_modified, req.verified.id];

    db.query(text, values, (err, list) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err})
        }

        if(list.rowCount > 0) {
            
            return res.send({status: 200, data: list.rows});
        }
        else {
            return res.send({status: 499, data: "unable-to-create-bucket-list"});
        }
    })
}

function Lists(req, res) {
    //bck.id, bck.name, bck.date_created, bck.created_by, itm.name, itm.bucket_id, itm.id, itm.date_created, itm.date_modified, itm.done
    //LEFT OUTER JOIN items itm ON bck.id = itm.bucket_id
    let text = 'SELECT bck.* FROM bucketlists bck WHERE created_by = $1';
    let value = [req.verified.id];

    if(Object.entries(req.query).length === 0 && req.query.constructor === Object) { //good old fashion fetch all bucket lists if no request queries are supplied.
        db.query(text, value, (err, lists) => {
            if (err) {
                console.log("error: ", err);
                return res.send({status: 500, data: err})
            }

            if(lists) {
                return res.send({status: 200, data: lists.rows});
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
                    return res.send({status: 500, data: err});
                }

                if(lists) {
                    return res.send({status: 200, data: lists.rows});
                }
            })
        }
        else {
            return res.send({status: 500, data: "limit-request-out-of-range"});
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

            if(lists) {
                return res.send({status: 200, data: lists.rows});
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

        if(list) {
            return res.send({status: 200, data: list.rows});
        }
    });
}

function UpdateList(req, res) {
    if(!req.params.id) return res.send({status: 404, data: "id-required"});
    if(!req.body.name) return res.send({status: 404, data: "name-reqired"});

    let date_modified = new Date();

    if(req.body.name){
        let text = 'UPDATE bucketlists SET name = $1, date_modified = $2 WHERE id = $3 RETURNING *';
        let values = [req.body.name, date_modified, req.params.id];

        db.query(text, values, (err, updated) => {
            if (err) {
                console.log("error: ", err);
                return res.send({status: 500, data: err});
            }

            if(updated) {
                return res.send({status: 200, data: updated.rows});
            }
            else {
                return res.send({status: 404, data: "id-notfound"});
            }
        })
    }
    else {
        return res.send({status: 499, data: "nothing-to-update"});
    }
}

function DeleteList(req, res) {
    if(!req.params.id) return res.send({status: 404, data: "id-required"});

    let text = 'DELETE FROM bucketlists WHERE id = $1 RETURNING *';
    let values = [req.params.id];

    db.query('DELETE FROM items WHERE bucket_id = $1', [req.params.id], (err, deleted) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err});
        }

        if(deleted) {
            db.query(text, values, (err, deleted) => {
                if (err) {
                    console.log("error: ", err);
                    return res.send(err)
                }

                if(deleted.rowCount > 0) {
                    return res.send({status: 200, data: "deleted"});
                }
                else {
                    return res.send({status: 404, data: "id-notfound"});
                }
            })
        }
    })
}

function CreateListItem(req, res) {
    if(!req.body.name) return res.send({status: 404, data: "item-name-required"});
    if(!req.params.id) return res.send({status: 404, data: "id-required"});

    let date_created = new Date();
    let date_modified = new Date();

    let text = 'INSERT INTO items (name, done, date_created, date_modified, bucket_id) VALUES($1, $2, $3, $4, $5) RETURNING *';
    let values = [req.body.name, req.body.done, date_created, date_modified, req.params.id];

    db.query('SELECT * FROM bucketlists WHERE bucketlists.id = $1', [req.params.id], (err, blist) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err});
        }

        if(blist.rowCount > 0) {
            db.query(text, values, (err, list) => {
                if (err) {
                    console.log("error: ", err);
                    return res.send(err)
                }

                if(list.rowCount > 0) {
                    return res.send({status: 200, data: list.rows[0]});
                }
                else {
                    return res.send({status: 200, data: list.rows[0]});
                }
            })
        }
        else {
            return res.send({status: 404, data: "id-not-found"});
        }
    })
}

function ListItems(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let text = 'SELECT * FROM items WHERE items.bucket_id = $1';
    let value = [req.params.id];

    db.query(text, value, (err, items) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err});
        }

        if(items) {
            return res.send({status: 200, data: items.rows});
        }
        else {
            return res.send({status: 200, data: "items-not-found"});
        }
    });
}

function ListItem(req, res) {
    if(!req.params.id) return res.status(404).send({data: "bucket-list-id-required"});
    if(!req.params.item_id) return res.status(404).send({data: "item-id-required"});

    if(!req.params.id) return res.status(404).send({data: "id-required"});

    let text = 'SELECT * FROM items WHERE bucket_id = $1 AND id = $2';
    let value = [req.params.id, req.params.item_id];

    db.query(text, value, (err, item) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err});
        }

        if(item.rowCount > 0) {
            return res.send({status: 200, data: item.rows});
        }
        else {
            return res.send({status: 404, data: "item-notfound"});
        }
    });
}

function UpdateListItem(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});
    if(!req.params.item_id) return res.status(404).send({data: "id-required"});

    let date_modified = new Date();

    if(req.body.name) {
        let text = 'UPDATE items SET name = $1, date_modified = $2, done = $3 WHERE bucket_id = $4 AND id = $5 RETURNING *';
        let values = [req.body.name, date_modified, req.body.done, req.params.id, req.params.item_id];

        db.query(text, values, (err, updated) => {
            if (err) {
                console.log("error: ", err);
                return res.send({status: 500, data: err});
            }

            if(updated) {
                return res.send({status: 200, data: updated.rows});
            }
            else {
                return res.status(404).send({data: "id-notfound"});
            }
        })
    }
    else {
        return res.send({status: 499, data: "nothing-to-update"});
    }
}

function DeleteListItem(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});
    if(!req.params.item_id) return res.status(404).send({data: "item_id-required"});

    let text = 'DELETE FROM items WHERE bucket_id = $1 AND id = $2 RETURNING *';
    let values = [req.params.id, req.params.item_id];

    db.query(text, values, (err, deleted) => {
        if (err) {
            console.log("error: ", err);
            return res.send({status: 500, data: err});
        }

        if(deleted.rowCount > 0) {
            return res.send({status: 200, data: "deleted"});
        }
        else {
            return res.send({status: 404, data: "id-notfound"});
        }
    })
}

module.exports = apirouter;