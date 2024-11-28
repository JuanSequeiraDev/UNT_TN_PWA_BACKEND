import e from "express"
import ENVIROMENT from "../config/enviroment.js"
import { FieldConfig } from "../helpers/builders/field_config.builder.js"
import ResponseBuilder from "../helpers/builders/response.builder.js"
import transporterEmail from "../helpers/emailTransporter.helpers.js"
import User from "../models/user.model.js"
import { verifyEmail, verifyMinLength, verifyString } from "../utils/verifications.js"
import bcrypt, { compareSync } from 'bcrypt'
//npm i bcrypt
import jwt from 'jsonwebtoken'
import AppError from "../errors/app.error.js"
import userRepository from "../repositories/user.repository.js"
//npm i jsonwebtoken

export const registerController = async (req, res, next) => {
    try {
        const { name, password, email } = req.body

        if(!email){
            return next(new AppError('Email no recibido', 400, {email: email}, "MISSING_DATA"))
        }
        if(!password){
            return next(new AppError('Password no recibido', 400, {password: password}, "MISSING_DATA"))
        }
        if(!name){
            return next(new AppError('Name no recibido', 400, {name: name}, "MISSING_DATA"))
        }

        //Hacer un builder con fields, validate y hasErrors
        const loginConfig = new FieldConfig()
            .setNewField('email', email)
            .setFieldValidations('email',
                [
                    verifyEmail,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            ).setNewField('name', name)
            .setFieldValidations('name',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 5)
                ]
            )
            .setNewField('password', password)
            .setFieldValidations('password',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .validateFields()
            .build()

        if (loginConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, loginConfig, "VALIDATION_ERROR"))
        }

        const passwordHash = await bcrypt.hash(loginConfig.password.value, 10)

        // Recibe 3 parametros en el siguiente orden: payload(contenido del token), Secret_key(clave utilizada para firmar SENSIBLE), options(es un objeto con la configuracion)
        const validationToken = jwt.sign({ email: loginConfig.email.value }, ENVIROMENT.SECRET_KEY, {
            expiresIn: '1d'
        })

        const redirectUrl = ENVIROMENT.BACKEND_URL + '/api/auth/verify-email/' + validationToken

        const result = await transporterEmail.sendMail({
            subject: 'Valida tu email',
            to: loginConfig.email.value,
            html: `
                <h1>Valida tu mail</h1>
                <p>Para validar tu mail da click <a href='${redirectUrl}'>aqui</a></p>
            `
        })

        const userCreated = await userRepository.createUser(
            {
                name: loginConfig.name.value,
                email: loginConfig.email.value,
                password: passwordHash
            })

            console.log(userCreated)

        const response = new ResponseBuilder()
            .setCode('SUCCESS')
            .setOk(true)
            .setStatus(200)
            .setData(
                { registerResult: loginConfig }
            )
            .build()

            return res.json(response)
    }
    catch (error) {
        if (error.code === 11000) {
            return next(new AppError("El email ya esta registrado", 400, error.errorResponse.keyValue, 'EMAIL_DB_MATCH_ERROR'))
        }
        
        return next(error)
    }
}


export const verifyEmailController = async (req, res, next) => {
    try {
        const { validation_token } = req.params

        if(!validation_token){
            return next(new AppError('validation_token no recibido por parametros', 400, {validation_token: validation_token}, "MISSING_DATA"))
        }

        const payload = jwt.verify(validation_token, ENVIROMENT.SECRET_KEY)

        if(!payload.email){
            return next(new AppError('No hay ningun email en el payload del token', 400, {payload: payload}, "MISSING_DATA"))
        }

        const email_to_verify = payload.email
        const usuario_a_verificar = await userRepository.getByEmail(email_to_verify)

        if(!usuario_a_verificar){
            return next(new AppError('No se ha encontrado ningun usuario en la DB con el email del payload', 404, {usuario: usuario_a_verificar, email: email_to_verify}, "USER_NOT_FOUND" ))
        }
        
        usuario_a_verificar.emailVerified = true
        await usuario_a_verificar.save()
        return res.redirectUrl(ENVIROMENT.FRONTEND_URL) //Otra opcion seria:  res.sendStatus(200)
    }
    catch (error) {
        next(error)
    }
}


export const loginController = async (req, res, next) => {
    try {
        //Recibir del body el email y la password
        //Validar estos datos
        //Buscar en la DB si existe un usuario con dicho mail
        //Comparar la password hasheada del usuario con la password recibida | hecho
        //Si no es igual tirar error
        //En caso de existir verificar si su emailVerify es verdadero (sino tirar error de logeo)
        //Generar un token de acceso con jwt donde guardemos datos como el user_id, nombre y el email
        //Responder exitosamente con el token de acceso
        const { email, password } = req.body

        if(!email){
            return next(new AppError('Email no recibido', 400, {email: email}, "MISSING_DATA"))
        }
        if(!password){
            return next(new AppError('Password no recibido', 400, {password: password}, "MISSING_DATA"))
        }

        const loginConfig = new FieldConfig()
            .setNewField('email', email)
            .setFieldValidations('email',
                [
                    verifyEmail,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .setNewField('password', password)
            .setFieldValidations('password',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .validateFields()
            .build()

        if (loginConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, loginConfig, "VALIDATION_ERROR"))
        }

        const user = await userRepository.getByEmail(email)

        if (user === null) {
            return next(new AppError("No se encontro ningun usuario con este mail en la DB", 404, { user: user }, "USER_NOT_FOUND"))
        }

        const passwordMatch = await bcrypt.compare(loginConfig.password.value, user.password)
        if (!passwordMatch) {
            return next(new AppError("La contraseña difiera de la contraseña respectiva al email en la DB", 400, { passwordMatch: passwordMatch }, "INCORRECT_PASSWORD"))
        }

        if (!user.emailVerified ) {
            return next(new AppError("No se verifico el mail mediante el url enviado previamente", 403, { emailVerified: user.emailVerified }, "EMAIL_NOT_VERIFIED"))
        }

        const acces_token = jwt.sign({
            user_id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }, ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '60m' //Esto determina cuanto dura la sesion
            })

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setCode('LOGGED_SUCCES')
            .setMessage('LOG SUCCES!')
            .setData({
                access_token: acces_token,
                user_info: {
                    user_id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })
            .build()

        return res.status(200).json(response)

    }
    catch (error) {
        return next(error)
    }
}


export const forgotPasswordController = async (req, res, next) => {
    //Recibir el email del body
    //Buscar al usuario por email en la DB
    //Si esta todo bien firmar reset_token con el email del usuario
    //Crear una resetUrl = url_front/reset-password/:${reser_token}
    //Enviar un mail con asunto recuperar contraseña y un link con el resetUrl
    try {
        const { email } = req.body

        if(!email){
            next(new AppError('Email no recibido', 400, {email: email}, "MISSING_DATA"))
        }

        const loginConfig = await new FieldConfig()
            .setNewField('email', email)
            .setFieldValidations('email',
                [
                    verifyEmail,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .validateFields()
            .build()

        if (loginConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, loginConfig, "VALIDATION_ERROR"))
        }

        const user = await userRepository.getByEmail(email)

        if (!user) {
            return next(new AppError('Ningun usuario coincide con ese mail en la bas de datos', 404, {user: user} , "USER_NOT_FOUND"))
        }

        const reset_token = jwt.sign({ email: user.email }, ENVIROMENT.SECRET_KEY,
            {
                expiresIn: '1d'
            })

        const redirectUrl = ENVIROMENT.FRONTEND_URL + '/reset-password/' + reset_token

        const result = await transporterEmail.sendMail({
            subject: 'Recuperar contraseña',
            to: loginConfig.email.value,
            html: `
                <h1>Recupera tu contraseña</h1>
                <p>Para recuperar tu contraseña da click <a href='${redirectUrl}'>aqui</a></p>
            `
        })

        const response = new ResponseBuilder()
            .setStatus(200)
            .setOk(true)
            .setCode('SUCCES')
            .setData({
                message: 'EMAIL SENT SUCCESFULLY'
            })
            .build()

        return res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const resetPasswordController = async (req, res, next) => {
    //capturar el reset-token
    //Validar el token y obtienen el email del payload
    //Buscar en la DB al usuario con ese email
    //Validar que la contraseña nueva este
    //Hashear la password (bcrypt)
    try {
        const { reset_token } = req.params

        if(!reset_token){
            next(new AppError('No se recibio un reset_token por parametros', 400, {reset_token: reset_token}, "MISSING_DATA"))
        }

        const { password } = req.body

        if(!password){
            next(new AppError('No se recibio la nueva contraseña', 400, {password: password}, "MISSING_DATA"))
        }

        const loginConfig = new FieldConfig()
            .setNewField('password', password)
            .setFieldValidations('password',
                [
                    verifyString,
                    (field_name, field_value) => verifyMinLength(field_name, field_value, 10)
                ]
            )
            .validateFields()
            .build()

        if (loginConfig.hayErrores) {
            return next(new AppError('Uno de los campos tiene un formato invalido', 400, loginConfig, "VALIDATION_ERROR"))
        }

        const payload = jwt.verify(reset_token, ENVIROMENT.SECRET_KEY)

        if (!payload.email) {
            return next(new AppError('No se ha recibido un email mediante el payload del token', 400, {email: payload.email} , "MISSING_DATA"))
        }

        const user = await userRepository.getByEmail(payload.email)

        if (!user) {
            return next(new AppError('Ningun usuario coincide con el mail recibido en la base de datos', 404, {user: user} , "USER_NOT_FOUND"))
        }

        const hashedPasswrod = await bcrypt.hash(password, 10)
        user.password = hashedPasswrod
        await user.save()

        const response = new ResponseBuilder()
            .setStatus(200)
            .setOk(true)
            .setCode('SUCCES')
            .setData({
                message: 'PASSWORD SUCCESFULLY CHANGED!'
            })
            .build()

        return res.status(201).json(response)
    }
    catch (error) {
        next(error)
    }
}