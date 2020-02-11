const { Pool } = require('pg');

const connectionString = 'postgresql://postgres:delta2016@localhost:5432/BucketList';

const pool = new Pool(
	{
		connectionString: connectionString
	}
);

pool.connect();

module.exports = {
   	query: (text, values, callback) => {
	    const start = Date.now()
	    return pool.query(text, values, (err, res) => {
	      	const duration = Date.now() - start
	      	console.log('executed query', { text, duration, rows: res })
	      	callback(err, res)
	    })
  	},
}