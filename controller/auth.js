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
            f
        }
        )
  )
}
