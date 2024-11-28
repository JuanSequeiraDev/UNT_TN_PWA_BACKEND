import User from "../models/user.model.js"

class userRepository{
    static async createUser ( new_user_data ) {
        const new_user = new User(new_user_data)
        return await new_user.save()
    }

    static async updateUser ( user_id, updated_data) {
        return User.findByIdAndUpdate(user_id, updated_data)
    }

    static async getAllusers ( ) {
        return User.find({active: true})
    }

    static async getById (user_id ) {
        return User.findById(user_id)
    }

    static async deleteUser( user_id ) {
        //El {new: true} indica que debe devolver el user actualizado
        return User.findByIdAndDelete(user_id, {active: false}, {new: true})
    }

    static async getByEmail( email ){
        return User.findOne({email: email})
    }

    /* static async getByEmailAndVerify( email ){           //Corta la posibilidad de una validacion sencilla de usuario no encontrado
        const usuario_a_verificar = User.findOne({email: email})
        usuario_a_verificar.emailVerified = true
        return await usuario_a_verificar.save()
    } */
}

export default userRepository