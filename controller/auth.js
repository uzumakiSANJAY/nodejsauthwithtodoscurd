let response = require('../response');
let connection = require ('../connection');
let moment = require ('moment');
let crypto = require ('crypto');


async function createToken(request , reply) {
  let now = moment().format("YYYY-MM-DD HH:mm:ss").toString();
  let secret = request.body.secret;
  let token = request.body.token;
  let created_at = now;
  let updated_at = now;

  // Fetch user id
  let user_id = await getUser(token);

  //Get id secret key
  let secret_id = await getSecret(secret);

  //Both ids must exist in each table, if there is not one then an error message must be thrown.
  if(!secret_id || !user_id){
    return response.badRequest("", "Your token or secret key is wrong!", reply);
  }

  //Creates a random string of approximately 20 characters
  let id = crypto.ramdomBytes(25).toString('hex');

  //Make today's date + 30 days in the future for the active period of the token.
  let expires_at = moment().add(30, 'days').format('YYYY-MM-DD HH:mm:ss').toString();

  let sql = `INSERT INTO authentication (id , user_id , secret_id, expires_at , created_at,updated_at)
    VALUES(?,?,?)`;
  let data = await new Promise((reslove)=>
    connection.query(sql,
        [id , user_id , secret_id , expires_at , created_at , updated_at], function(error , rows){
            if (error) {
                console.log(error);
                return response.badRequest('',`${error}`,reply)
            }

            let array = {
                token : id,
                expires_at : expires_at
            };
            return reslove(array)
        })
  );
  return response.ok(data, `Successfully created authentication!`, reply);
}

async function getUser(token){
    return new Promise((resolve)=>
        connection.query('SELECT id FROM users WHERE remember_token = ?',[token], function(error,rows){
            if (error) {
                console.log(error)
            }

            return rows.length > 0 ? resolve(rows[0].id) : resolve(false)
        })
    )
}
async function getSecret (secret) {
    return new Promise((resolve) =>
        connection.query('SELECT id FROM secret WHERE secret = ?', [secret], function (error, rows) {
            if(error){
                console.log(error);
            }

            return rows.length > 0 ? resolve(rows[0].id) : resolve(false);
        })
    );
}
async function checkToken (request, reply) {
    let token = request.body.token.toString();
    let user_token = request.body.user_token.toString();
    let now = moment().format('YYYY-MM-DD HH:mm:ss').toString();

    let sql = `SELECT authentication.*, users.remember_token FROM authentication 
    INNER JOIN users ON users.id = authentication.user_id WHERE authentication.id = ? AND users.remember_token = ?`;
    let data = await new Promise((resolve) =>
        connection.query(sql, [token, user_token], function (error, rows) {
                if(error){
                    console.log(error);
                    return response.badRequest('',  `${error}`, reply)
                }

                if(rows.length > 0){
                    return rows[0].remember_token === user_token ? resolve(rows[0].expires_at) : resolve(false);
                }
                else{
                    return response.badRequest({}, "Token yang kamu masukkan salah!", reply);
                }

            })
    );

    let array = { expires_at: data};
    let message = moment(data).format('YYYY-MM-DD HH:mm:ss').toString() > now ?
        'This token is yours and is still active today!' : "Your token is no longer active!";

    return array ? response.ok(array, message, reply) : response.badRequest({}, message, reply);
}

module.exports = {
    createToken, 
    checkToken
};
