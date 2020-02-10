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

if(!appstorage.get("blacklist")) {
    appstorage.set("blacklist", []);
}

apirouter.use(function(req, res, next) {
    console.log(req.method, req.url);
    next(); 
});

apirouter.post('/auth/save', Save);
apirouter.post('/auth/login', Login);
apirouter.get('/auth/logout', middlewares.checkToken, Logout);
apirouter.post('/bucketlists', middlewares.checkToken, CreateBucketList);
apirouter.get('/bucketlists', middlewares.checkToken, BucketLists);
apirouter.get('/bucketlists/:id', middlewares.checkToken, List);
apirouter.put('/bucketlists/:id', middlewares.checkToken, UpdateBucketList);
apirouter.delete('/bucketlists/:id', middlewares.checkToken, DeleteBucketList);
apirouter.post('/bucketlists/:id/items', middlewares.checkToken, CreateNewBucketListItem);
apirouter.get('/bucketlists/:id/items', middlewares.checkToken, BucketListItems);
apirouter.get('/bucketlists/:id/items/:item_id', middlewares.checkToken, BucketListItem);
apirouter.use(function(req, res, next) {
  return res.status(404).send({ message: ' Not found.' });
});

function Save(req, res) {
    User.create({ email: req.body.email, name: req.body.name, password: req.body.password })
        .then((created) => {
            console.log("")
            if(created) return res.status(200).send({data: "created"});
            else {return res.status(500).send({data: "not-created"})}
        })
        .catch((error) => {
            console.log("error: ", error);
            return res.status(500).send({data: "not-created"})
        })
}

function Login(req, res) {
	if(!req.body.email) return res.status(499).send({data: "email-required"});
    if(!req.body.password) return res.status(499).send({data: "password-required"});

    User.findOne({ where: { email: req.body.email, password: req.body.password } })
        .then((user) => {
            if(!user) {
                return res.status(404).send({data: "user-notfound"});
            }
            else {
                let token = jwt.sign({
                    email: req.body.email,
                    name: user.name
                }, supersecret, {
                    expiresIn: "1h" // expires in 24 hours.
                });

                let owner = {};

                owner.username = user.username;
                owner.token = token;
                owner.role = "guest";

                return res.status(200).send({data: owner})
            }
            console.log("user: ", user);
        })
        .catch((error) => {
            console.log("error: ", error);
        })
}

function Logout(req, res) {
    let blacklistarray = appstorage.get("blacklist");

    blacklistarray.push(req.verified.token);
    appstorage.set("blacklist", blacklistarray);

    return res.status(200).send({data: "logout-successful"});
}

function CreateBucketList(req, res) {
    if(!req.body.name) return res.status(404).send({data: "bucketlist-name-required"});

    User.findOne({email: req.verified.email}, (err, user) => {
        if(err) console.log("err: ", err.message);

        if(!user) return res.status(404).send({data: "user-notfound"});

        if(user) {
            BucketList.findOne({name: req.body.name}, (err, bucketlist) => {
                if(err) console.log("err: ", err.message);

                if(!bucketlist) {
                    let list = new BucketList();

                    list.name = req.body.name;
                    list.created_by = user.email;
                    list.id = config.generateCode();

                    list.save((err, success) => {
                        if(err) return res.status(500).send({data: "unable-save-bucket-list"});

                        if(success) {
                            return res.status(200).send({data: "Bucket-List-Created"});
                        }
                    })
                }
                else {
                    return res.status(409).send({data: "bucket-list-exists"});
                }
            })
        }
    })
}

function BucketLists(req, res) {
    BucketList.find({}, {"name" : 1, "date_created" : 1, "created_by" : 1, "id" : 1, "items" : 1, "_id" : 0}, (err, lists) => {
        if(err) console.log("err: ", err.message);

        if(lists) return res.status(200).send({data: lists});
    })
}

function List(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    BucketList.findOne({id: req.params.id}, {"name" : 1, "date_created" : 1, "created_by" : 1, "id" : 1}, (err, list) => {
        if(err) console.log("err: ", err.message);

        if(list) return res.status(200).send({data: list});

        else {
            return res.status(404).send({data: "list-notfound"});
        }
    })
}

function UpdateBucketList(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    BucketList.updateOne({id: req.params.id}, {
        $set: {
            id: req.body.id || list.id,
            name: req.body.name || list.name,
            date_modified: new Date()
        }
    }, (err, listupdated) => {
        console.log("listupdated: ", listupdated)
        if(err) return res.json({status: false, data: err});

        if(listupdated.nModified > 0) {
            return res.status(200).send({data: "updated"});
        }
        else {
            return res.status(499).send({data: "unable-to-update. Id not found."});
        }
    })
}

function DeleteBucketList(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    BucketList.deleteOne({id: req.params.id}, (err, idremoved) => {
        if(err) console.log("err: ", err.message);

        if(idremoved.deletedCount > 0) {
            return res.status(200).send({data: "deleted"});
        }
        else {
            return res.status(499).send({data: "unable-to-update. Id not found."});
        }
    });
}

function CreateNewBucketListItem(req, res) {
    let item = {};
    item["id"] = config.generateCode();
    item["name"] = req.body.name;

    if(!req.params.id) return res.status(404).send({data: "id-required"});
    if(!req.body.name) return res.status(404).send({data: "item-name-required"});

    BucketList.findOne({id: req.params.id}, (err, list) => {
        if(err) console.log("er: ", err.message);

        if(list) {
            BucketList.updateOne({id: req.params.id}, {$push: {"items": item}}, (err, listupdated) => {
                if(err) return res.json({status: false, data: err});

                if(listupdated.nModified > 0) {
                    return res.status(200).send({data: "item-created"});
                }
                else {
                    return res.status(499).send({data: "unable-to-update. Id not found."});
                }
            })
        }
        else {
            return res.status(404).send({data: "id-not-found"});
        }
    })
}

function BucketListItems(req, res) {
    if(!req.params.id) return res.status(404).send({data: "id-required"});

    BucketList.findOne({id: req.params.id}, {"items" : 1}, (err, items) => {
        if(err) console.log("err: ", err.message);

        if(items) return res.status(200).send({data: items});

        else {
            return res.status(404).send({data: "items-not-found"});
        }
    })
}

function BucketListItem(req, res) {
    if(!req.params.id) return res.status(404).send({data: "bucket-list-id-required"});
    if(!req.params.item_id) return res.status(404).send({data: "item-id-required"});

    BucketList.findOne({id: req.params.id}, {"items" : 1}, (err, list) => {
        if(err) console.log("err: ", err.message);

        console.log("list: ", list.items);

        if(list) {            
            BucketList.findOne({"list.items": {id: req.params.item_id}}, (err, item) => {
                if(err) console.log("err: ", err.message);

                console.log("item: ", item);

                if(item) return res.status(200).send({data: item});

                else {
                    return res.status(500).send({data: "item-not-found"});
                }
            })
        }

        else {
            return res.status(404).send({data: "bucket-list-id-not-found"});
        }
    })
    // body...
}

function UpdateBucketListItem(req, res) {
    // body...
}

function DeleteBucketListItem(req, res) {
    // body...
}

module.exports = apirouter;