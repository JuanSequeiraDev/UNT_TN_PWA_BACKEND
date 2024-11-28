import { Router } from "express";
import {forgotPasswordController, loginController, registerController, resetPasswordController, verifyEmailController} from "../controllers/authentication.controller.js";
import ResponseBuilder from "../helpers/builders/response.builder.js";

const authRouter = Router()

/* authRouter.put('/reset-password/:reset-token', resetPasswordController) */

/* authRouter.put('/reset-password/', (req, res) =>{
    const response = new ResponseBuilder()
    .setOk(true)
    .setStatus(200)
    .setData({})
    .build()
    console.log('hola')
    res.status(200).json(response)
}) */

authRouter.get('/verify-email/:validation_token', verifyEmailController)

authRouter.post('/register', registerController)

authRouter.post('/login', loginController)


authRouter.post('/forgot-password', forgotPasswordController)

authRouter.put('/reset-password/:reset_token', resetPasswordController)

export default authRouter