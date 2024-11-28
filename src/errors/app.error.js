class AppError extends Error{
    constructor(message, status_code, data, code){
        super(message)
        this.status_code = status_code
        //Error (sintaxis, err de DB),    Fail(no se encontro el producto, etc )
        this.status = String(status_code).startsWith('4') ? 'fail'  : 'error'    

        this.data = data
        this.code = code
        //Si debemos responder con ese error 
        //Todos los errores de aplicaicon deben tener su propia respuesta
        this.is_operational

        //Capturar la traza del error
        Error.captureStackTrace(this, this.constructor)
    }
}

export default AppError

//new Error('No se que paso') => {message: 'no se que paso'}