const crypto = require('crypto');
exports.auth = (req, res, next) => {
    try {
        const payload = req.headers['x-zevent-signature'];
        const data = req.body;
        const encoded = crypto.createHash('sha256').update(`${process.env.APP_ID}${JSON.stringify(data)}${data.timestamp}${process.env.OA_SECRET_KEY}`).digest('hex');
        const signature = `mac=${encoded}`;

        if(payload === signature) {
            next();
        } else {
            throw new Error('Authenticate failed');
        }

    } catch(e) {
        res.status(200).send();
        console.log(e);
    }
}