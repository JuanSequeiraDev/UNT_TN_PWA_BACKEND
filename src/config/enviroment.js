//npm i dotenv
import dotenv from 'dotenv'

//process es una variable global que guara datos del proceso de ejecucion de node
//Configuramos en process.env las variables de entorno del archivo .env

dotenv.config() //Se puede pasar un objeto con un path hacie el .env


const ENVIROMENT = {
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
    EMAIL_USER: process.env.EMAIL_USER || '',
    SECRET_KEY: process.env.SECRET_KEY || '',
    FRONTEND_URL: process.env.FRONTEND_URL || '',
    BACKEND_URL: process.env.BACKEND_URL || '',
    MYSQL: {
        HOST: process.env.MYSQL_HOST || '',         //http://localhost:3306
        DATABASE: process.env.MYSQL_DATABASE || '', //el nombre de la DB
        USERNAME: process.env.MYSQL_USERNAME || '', //Local: root
        PASSWORD: process.env.MYSQL_PASSWORD || ''  //Local: ''
    },
    MONGO_DB_CONNECTION_STR: process.env.MONGO_DB_CONNECTION_STR || '',
    MONGO_DB_DATABASE: process.env.MONGO_DB_DATABASE || ''
}


export default ENVIROMENT