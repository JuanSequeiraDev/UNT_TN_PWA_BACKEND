//Logica de conexion con la Database

import mongoDB from "mongoose"
import ENVIROMENT from "./enviroment.js"

const MONGO_URL = ENVIROMENT.MONGO_DB_CONNECTION_STR + '/' + ENVIROMENT.MONGO_DB_DATABASE

//.connect se utiliza para establecer una conexion con la DB
//Recibe una connection_string (url de la DB) y un objeto de configuracion
mongoDB.connect(MONGO_URL, {})
.then(
    () =>{
        console.log('Se establecio la conexion con mongoDB')
        
    }
)
.catch(
    (error)=> {
        console.error('La conexion con mongoDB ha fallado', error)
    }
)
.finally(
    ()=>{
        console.log('El proceso de conexion con la DB esta finalizado')
    }
)



export default mongoDB