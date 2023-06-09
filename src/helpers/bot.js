const axios = require('axios');
require('dotenv').config();

const sendMessage  = async (userId, message) => {
    const url = `https://openapi.zalo.me/v2.0/oa/message?access_token=${config.ACCESS_TOKEN}`;

    const result = await axios.post(url, {
        "recipient": {
            "user_id": userId
        },
        "message": {
            "text": message
        }
    });

    if(result.data.message != 'Success') {
        throw new Error(`Có lỗi khi gửi tin nhắn: ${result.data.message}`);
    }

    return result.data;
}

const getUsers = async( offset, count) => {
    const url = `https://openapi.zalo.me/v2.0/oa/getfollowers`

    const result = await axios.get(url, {
        params: {
            access_token: process.env.ACCESS_TOKEN,
            data: {
                offset,
                count
            }
        }
    });

    if(result.data.message != 'Success') {
        throw new Error(`Có lỗi khi lấy danh sách người theo dõi: ${result.data.message}`);
    }

    return result.data.data;
}
module.exports = {
    sendMessage, 
    getUsers
};