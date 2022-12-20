let response = require('../response');
let connection = require('../connection');
let moment = require('moment');

async function check(token , reply){
    let now = moment().format("YYYY-MM-DD HH:mm:ss").toString();
    let sql = "SELECT * FROM authentication WHERE id = ?";
    return new Promise(() =>
        connection.query(sql , [token], function(error, rows){
            if (error) {
                console.log(error);
                return response.badRequest('',`${error}`,reply)
            }
            if (rows.length > 0) {
                let message =  moment(rows[0].expires_at).format('YYYY-MM-DD HH:mm:ss').toString() > now;
                if (message) {
                    return resolve({ user_id : rows[0].user_id,secret_id : rows[0].secret_id,
                        token : rows[0].id
                    });
                } else {
                    return response.badRequest('',"Token Active Time has expired!",reply)
                }
            } 
            else {
                return response.badRequest('',"The Token is invalid",reply)
            }
        })
    );
}
module.exports = {
    check
};