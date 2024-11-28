import mysql from 'mysql2/promise'
import ENVIROMENT from './enviroment.js'

//Pool es una especie de credenciales usadas para realizar la consulta
const pool = mysql.createPool(
    {
        host: ENVIROMENT.MYSQL.HOST,
        user: ENVIROMENT.MYSQL.USERNAME,
        password: ENVIROMENT.MYSQL.PASSWORD,
        database: ENVIROMENT.MYSQL.DATABASE
    }
)

pool.getConnection().then(
    () =>{console.dir('Conexion con mySql exitosa')}
)
.catch(
    err=>{
        console.error('Error en conexion con mysql ', err)
    }
)

export default pool