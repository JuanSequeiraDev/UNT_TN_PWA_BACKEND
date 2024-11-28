

import AppError from "../errors/app.error.js";
import ResponseBuilder from "../helpers/builders/response.builder.js";

const errorHandlerMiddleware = (err, req, res, next) =>{
    //Como no todos los errores de la app van a tener status_code o status en caso de no haber asumimos que es un error de servidor
    err.status_code = err.status_code || 500
    err.status = err.status || 'error'

    if(err.status.code !== 500){
        err.is_operational = true
    }

    if(err.is_operational){
        return res.json({
            status: err.status,
            message: err.message,
            data: err.data,
            code: err.code
        })
    }

    console.error('ERROR: FATAL ERROR ', err)

    return res.status(500).json({
        status: 'error',
        message: 'Algo anda muy mal aqui'
    })
}

export default errorHandlerMiddleware