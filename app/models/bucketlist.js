let mongoose = require('mongoose');
let Schema   = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

let BucketListSchema = new Schema({
    "id": {type : String},
    "name" : {type : String},
    "items" : [
        {
            "id" : {type : String},
            "name" : {type : String},
            "date_created" : { type: Date, default: new Date() },
            "date_modified" : { type: Date, default: new Date() },
            "done" : {type: Boolean, default: false}
        }
    ],
    "date_created" : { type: Date, default: new Date() },
    "date_modified" : { type: Date, default: new Date() },
    "created_by" : {type: String}
});

module.exports = mongoose.model('BucketList', BucketListSchema);