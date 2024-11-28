import jwt from 'jsonwebtoken'
import ENVIROMENT from '../config/enviroment.js'
import AppError from '../errors/app.error.js'

const authMiddleware = (roles_permitidos) => {
    return (req, res, next) => {
        try {
            //Este header generalente tiene informacion de la autorizacion
            const auth_header = req.headers['authorization'] // 'Bearer token_value'

            if (!auth_header) {
                return res.json({ message: 'Falta el token de autorizacion' })
            }

            //Bearer token_value.split(' ') => ['Bearer', 'token_value']
            const acces_token = auth_header.split(' ')[1]

            //Verificar que el primer valor sea el bearer

            if (!acces_token) {
                return res.json({ message: 'El token de autorizacion esta malformado' })
            }

            const user_sesion_payload_decoded = jwt.verify(acces_token, ENVIROMENT.SECRET_KEY)

            if(!roles_permitidos.includes(user_sesion_payload_decoded.role)){
                return res.status(403).json({message: 'No tienes permiso para esta operacion' , status: 403})
            }

            //Request es un objeto con los datos de la consulta

            //Guardamos en el objeto request informacion de sesion del usuario
            req.user = user_sesion_payload_decoded

            next() //Ir al controlador o middleware siguiente
        }
        catch (error) {
            console.error(error)
            res.json(error.message)
        }
    }
}



export default authMiddleware