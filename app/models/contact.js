let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ComplaintsSchema = new Schema({
    complaintemail: {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: function(v) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
    },
    },
    createdon: {type: Date, default: Date.now() },
    complaintname: {type: String},
    complaintmessage: {type: String},
    complaintstatus: {type: String}
});

module.exports = mongoose.model('Complaints', ComplaintsSchema);
