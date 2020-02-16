const { Pool } = require('pg');

//const connectionString = 'postgresql://postgres:delta2016@localhost:5432/BucketList';
const connectionString = 'postgres://qnbpnbsg:PY7GSv2dgbahfGZy62Ra9wNfuXhQe_f2@rajje.db.elephantsql.com:5432/qnbpnbsg';

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
	    	console.log("res: ", res);
	      	const duration = Date.now() - start
	      	//console.log('executed query', { text, duration, rows: res })
	      	callback(err, res)
	    })
  	},
}