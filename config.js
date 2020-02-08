module.exports = {
    'port': process.env.PORT || 8080,
    'BASE_URL': "http://localhost:8050",
    'database': 'mongodb://localhost:27017/simpleblog',
    'secret': 'Delta!!2016!sar6fa2a37f65d$#$%$%#$d8d79d8d77dfidf0ddi$faf3$$#f2f1f4f5sdjskjgh97sughshs',
    'hash' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVnd3VhbnlpMDQyQGdtYWlsLmNvbSIsImlhdCI6MTU1NjM2Mzk0OCwiZXhwIjoxNTU2MzY0MzA4fQ.hlvsog5NVcZphKxpJPPBBoMww9XRNZ-_h51osqyBqPg/',
    generateCode: function () {
        var length = 4,
            charset = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXY",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },
}