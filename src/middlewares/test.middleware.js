


//Los Middlewares son funciones que se interponen entre una consulta y la respuesta del servidor (controladores)
//Recibe request, response y next
//next es una funcion que va a indicar que la consulta puede seguir al siguiente middleware o controlador
const testMiddleware = (req, res, next) =>{
    console.log('middleware ejecutado')
    if(.5 < Math.random()){
        res.json({message: 'error no has tenido suerte'})
    }
    else{
        //Cuando active next estoy pasando al siguiente middleware o controlador
        next()
    }
}

export default testMiddleware