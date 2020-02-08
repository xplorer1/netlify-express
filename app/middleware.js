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

        if(SearchBlackList(token)) {
            return res.status(401).send({data: "token-invalid"});
        }

        if (token) {
            jwt.verify(token, supersecret, function(err, verified) {
                if (err) {
                    if (err.name == 'TokenExpiredError') {
                        return res.status(403).send({ success: false, message: 'Token expired.' });
                    } else {
                        return res.json({ success: false, message: 'Failed to authenticate token.' });
                    }
                } else {
                    //delete decoded.iat;
                    //delete decoded.exp;
                    let obj = {};
                    obj.token = token;
                    obj.email = verified.email;
                    req.verified = obj;

                    next();
                }
            });
        } else {
            return res.status(403).send({ success: false, message: 'No token provided.' });
        }
    }
}

module.exports = middlewares;