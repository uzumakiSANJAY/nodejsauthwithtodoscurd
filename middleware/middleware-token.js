let response = require('../response');
let connectiom = require('../connection');
let moment = require('moment');

async function check(request , reply){
    console.log("Through Middleware");
    let token = request.headers.authorization;
    let now = moment().format("YYYY-MM-DD HH:mm:ss").toString();
    let sql = "SELECT * FROM authentication WHERE id = ?";

    return new Promise((resolve)=>
        connectiom.query(sql, [token.toString()] , function(error , rows){
            if(error){
                console.log(error);
                return response.badRequest('',`${error}`,reply)
            }
            if (rows.length > 0) {
                let message = moment(rows[0].expires_at).format('YYYY-MM-DD HH:mm:ss').toString() > now;
                if(message){
                    return resolve(true);
                }
                else{
                    return response.badRequest('',"Token Active Time has expired!",reply);
                }
            } else {
                return response.badRequest("", "Your token is wrong!", reply);
            }
        })
    )
}
module.exports = {
    check
};