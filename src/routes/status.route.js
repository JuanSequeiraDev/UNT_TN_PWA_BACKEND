/* Logica del /api/status */
import { Router } from 'express'
import postPingController from '../controllers/status.controller.js'
import testMiddleware from '../middlewares/test.middleware.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const statusRouter = Router()

statusRouter.post('/ping', authMiddleware, testMiddleware, postPingController)
statusRouter.get('/ping', (req, res)=>{
    res.sendStatus(200)
})
export default statusRouter