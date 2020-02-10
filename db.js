const { Pool } = require('pg');
const pool = new Pool();

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
});

sequelize
	.authenticate()
	.then(() => {
		console.log("connection established.");
	})
	.catch((error) => {
		console.log("unable to connect: ", error)
	})