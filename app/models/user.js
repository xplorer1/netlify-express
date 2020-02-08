let mongoose = require('mongoose');
let Schema   = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

let UserSchema = new Schema({
    'email' : {
        type: String,
        lowercase: true,
        required: true,
        validate: {
            validator: function(v) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: '{VALUE} is not a valid email!'
        }
    },
    'name' : String,
    'password' : String,
    'role' : String,
    'createdon' : { type: Date, default: new Date() }
});

// hash the password before the user is saved
UserSchema.pre('save', function (next) {
    let user = this;

    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    // generate the hash
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);

        // change the password to the hashed version
        user.password = hash;
        next();
    });
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function (password) {
    try{
        let user = this;

        return bcrypt.compareSync(password, user.password);
    }catch(e){
        console.log("password compare exception:", e);
        return false;
    }
};

module.exports = mongoose.model('User', UserSchema);