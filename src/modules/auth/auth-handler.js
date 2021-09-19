import Bcrypt from 'bcrypt'
class AuthHandler {
    get registerUser () {
        return {
            handler: async (request, h) => {
                try {
                   
                    const {payload} = request;
                    const checkUser = await request.systemDb.oneOrNone(`SELECT email FROM users WHERE email = $1`, payload.email)
                    if (checkUser) {
                        return h.response({message: 'email is already'}).code(400)
                    }

                    const salt = Bcrypt.genSaltSync(10);
                    payload.password = Bcrypt.hashSync(payload.password, salt);
                    await request.systemDb.query(`
                        insert into users (name, email, password, phone, is_admin, address)
                        VALUES ($<name>, $<email>, $<password>, $<phone>, true, $<address>)
                    `, payload)
                    return h.response({message: 'ok'})
                } catch (err) {
                    console.log(err)
                    return h.response({err: err.message})
                }
            }
        }
    }

    get loginUser () {
        return {
            handler: async (request, h) => {
                try {
                    const {payload, systemDb} = request;
                    const checkUser = await systemDb.oneOrNone(`SELECT * FROM users WHERE email = $1`, payload.email);

                    if (!checkUser) {
                        return h.response({message: 'Email Anda Tidak Terdaftar'}).code(400)
                    }

                    // cek password user
                    if (!Bcrypt.compareSync(payload.password, checkUser.password)) {
                        return h.response({message: 'email atau password anda salah'}).code(400)
                    };

                    const token = request.jwtHelper(checkUser);

                    return h.response({data: checkUser, token}).code(200)


                } catch (err) {
                    return h.response({message: err.message}).code(500)
                }
            }
        }
    }
}

export default new AuthHandler