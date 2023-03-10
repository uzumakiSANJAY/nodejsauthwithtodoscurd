let response = require('../response');
let connection = require('../connection');
let sha1 = require('sha1');
let moment = require('moment');
let crypto = require('crypto');

async function register (request, reply) {

    let now = moment().format('YYYY-MM-DD HH:mm:ss').toString();
    let name = request.body.name;
    let email = request.body.email;
    let password = sha1(request.body.password);
    let token = crypto.randomBytes(32).toString('hex');
    let created_at = now;
    let updated_at = now;

    let sql = `INSERT INTO users (name, email, password, remember_token, created_at, updated_at)
      values(?, ?, ?, ?, ?, ?)`;

    //Use promises when you need data to be returned after the callback
    let data = await new Promise((resolve) =>
        connection.query(sql,
            [name, email, password, token, created_at, updated_at], function (error, rows) {
            if(error){
                //Check first for existing data.
                if(error.code === 'ER_DUP_ENTRY'){
                    return response.badRequest('', `E-mail ${email} was used!`, reply)
                }

                // If not a duplicate entry then print the error that occurred.
                console.log(error);
                return response.badRequest('', `${error}`, reply)
            }

            return resolve({ name: name, email: email, token :  token});
        })
    );

    return response.ok(data, `Successful new user registration - ${email}`, reply);
}

async function login(request, reply) {

    let email = request.body.email;
    let password = request.body.password;
    let sql = `SELECT * FROM users WHERE email = ?`;

    let data = await new Promise((resolve) =>
        connection.query(sql, [email], function (error, rows) {
                if(error){
                    console.log(error);
                    return response.badRequest('', `${error}`, reply)
                }

                if(rows.length > 0){
                    let verify = sha1(password) === rows[0].password;

                    let data = {
                        name: rows[0].name,
                        email: rows[0].email,
                        token: rows[0].remember_token
                    };

                    return verify ? resolve(data) : resolve(false);
                }
                else{
                    return resolve(false);
                }
            })
    );

    if(!data){
        return response.badRequest('','The email or password you entered is incorrect!', reply)
    }

    return response.ok(data, `Login successfully!`, reply);
}

module.exports = {
    register, login
};