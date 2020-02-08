const express = require('express');
const app = express();
const apirouter = express.Router();
const User = require("../models/user");
const BucketList = require("../models/bucketlist");
const config = require('../../config');
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

apirouter.post('/auth/login', Login);
apirouter.get('/auth/logout', middlewares.checkToken, Logout);
apirouter.post('/bucketlists', middlewares.checkToken, CreateBucketList);
apirouter.get('/bucketlists', middlewares.checkToken, BucketLists);
apirouter.get('/bucketlists/:id', middlewares.checkToken, List);
apirouter.put('/bucketlists/:id', middlewares.checkToken, UpdateBucketList);
apirouter.delete('/bucketlists/:id', middlewares.checkToken, DeleteBucketList);
apirouter.use(function(req, res, next) {
  return res.status(404).send({ message: ' Not found.' });
});

function Login(req, res) {
	if(!req.body.email) return res.status(499).send({data: "email-required"});
    if(!req.body.password) return res.status(499).send({data: "password-required"});

    User.findOne({email: req.body.email}, (err, user) => {
        if(err) return res.json({status: false, data: err.message});

        if(!user) {
            return res.json({status: false, data: "user-notfound"});
        }

        else if(!user.comparePassword(req.body.password)) {
            return res.json({status: false, data: "user-notfound"});
        }

        else {
        	let token = jwt.sign({
                email: req.body.email,
            }, supersecret, {
                expiresIn: "1 week" // expires in 24 hours.
            });

            let owner = {};

            owner.username = user.username;
            owner.token = token;
            owner.role = "guest";

            return res.status(200).send({data: owner})
        }

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
    BucketList.find({}, {"name" : 1, "date_created" : 1, "created_by" : 1, "id" : 1, "_id" : 0}, (err, lists) => {
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

function BucketListItem(req, res) {
    // body...
}

function BucketListsItem(req, res) {
    // body...
}

function UpdateBucketListItem(req, res) {
    // body...
}

function DeleteBucketListItem(req, res) {
    // body...
}

module.exports = apirouter;