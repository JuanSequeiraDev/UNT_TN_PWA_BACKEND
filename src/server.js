import express from 'express'
import statusRouter from './routes/status.route.js'
import authRouter from './routes/auth.route.js'
import mongoDB from './config/db.config.js'
import cors from 'cors'
import productRouter from './routes/product.route.js'
import errorHandlerMiddleware from './middlewares/errorHandler.middleware.js'
import pool from './config/dbMysql.config.js'
import ProductRepository from './repositories/product.repository.js'
import { customCorsMiddleware } from './middlewares/cors.middleware.js'



const PORT = 3000
const app = express()


//ZnxV6fapfnXLP4WO Cluster pass

app.use(customCorsMiddleware)

//Whitelist o baneo de IPs, manejado por objeto de configuracion en el uso de cors
//Middleware que habilita a las consultas de origen cruzado
app.use(cors())

app.use(express.json({limit: '3mb'}))

app.use('/api/status', statusRouter)
app.use('/api/auth', authRouter )
app.use('/api/products', productRouter)


app.use(errorHandlerMiddleware)

app.listen(PORT, ()=>{
    console.log(`El servidor se esta ejecutando en http://localhost:${PORT}`)
})

