var jwt = require('jsonwebtoken');
var config = require('../config');
var supersecret = config.secret;
const appstorage = require("./nodepersist");

const middlewares = {
    SearchBlackList: function(token) {
        let array = appstorage.get("blacklist");

        return array.includes(token);
    },

    checkToken: function(req, res, next) {
        if(!req.headers.authorization) {
            return res.status(403).send({data: "token-required"});
        }

        let token = req.header("Authorization").replace("Bearer ", "");
        if(!token) return res.status(403).send({data: "token-required"});

        if(middlewares.SearchBlackList(token)) {
            console.log("check 1")
            return res.status(401).send({data: "token-invalid"});
        }

        if (token) {
            jwt.verify(token, supersecret, function(err, verified) {
                if (err) {
                    if (err.name == 'TokenExpiredError') {
                        console.log("check 2")
                        return res.status(401).send({data: "token-expired"});
                    } else {
                        return res.status(403).sed({data: "Failed-to-authenticate-token" });
                    }
                } else {
                    let obj = {};
                    obj.token = token;
                    obj.email = verified.email;
                    obj.id = verified.id;
                    obj.name = verified.name;
                    req.verified = obj;

                    next();
                }
            });
        } else {
            return res.status(403).send({message: "token-required" });
        }
    }
}

module.exports = middlewares;