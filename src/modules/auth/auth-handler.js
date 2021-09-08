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
}

export default new AuthHandler