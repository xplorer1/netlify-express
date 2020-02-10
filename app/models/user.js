const Sequelize = require("sequelize");
const sequelize = new Sequelize("BucketList", "postgres", "delta2016", {
    host: "localhost",
    dialect: "postgres",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const Model = Sequelize.Model;

class User extends Model {};

User.init({
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
},
    {
        sequelize: sequelize,
        modelName: 'user'
    })

sequelize.sync();

module.exports = User;

// hash the password before the user is saved
/*UserSchema.pre('save', function (next) {
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
});*/

// method to compare a given password with the database hash
/*UserSchema.methods.comparePassword = function (password) {
    try{
        let user = this;

        return bcrypt.compareSync(password, user.password);
    }catch(e){
        console.log("password compare exception:", e);
        return false;
    }
};*/