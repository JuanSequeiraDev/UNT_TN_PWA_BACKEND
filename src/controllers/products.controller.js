import AppError from "../errors/app.error.js";
import { FieldConfig } from "../helpers/builders/field_config.builder.js";
import ResponseBuilder from "../helpers/builders/response.builder.js";
import ProductRepository from "../repositories/product.repository.js";
import { verifyMinLength, verifyNumber, verifyString } from "../utils/verifications.js";

export const getAllProductsController = async (req, res, next) => {
    try {
        const productList = await ProductRepository.getAllProducts()

        if (!productList) {
            return next(new AppError('No se encontraron productos en la DB', 404))
        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(201)
            .setData({ products: productList })
            .setMessage('Succes')
            .build()
        return res.status(201).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const createProductController = async (req, res, next) => {

    try {
        const { user_id } = req.user
        if (!user_id) {
            return next(new AppError('No se encontro el user_id otorgado por el middleware de autorizacion', 400, {user_id: user_id}, 'MISSING_DATA'))
        }

        const { title, price, stock, description, category, image_base64 } = req.body

        const required = ["title", "price", "stock", "description", "category"]
        let missing_fields = false

        required.forEach(field => {
            if (!req.body.hasOwnProperty(field)) {
                missing_fields = true
            }
        })

        if (missing_fields) {
            return next(new AppError('Faltan valores para crear el producto', 400, {}, 'MISSING_DATA'))
        }

        const productConfig = new FieldConfig()
            .setNewField('title', title)
            .setFieldValidations('title', [verifyString, (field_name, field_value) => verifyMinLength(field_name, field_value, 3)])
            .setNewField('description', description)
            .setFieldValidations('description', [verifyString])
            .setNewField('category', category)
            .setFieldValidations('category', [verifyString, (field_name, field_value) => verifyMinLength(field_name, field_value, 10)])
            /* .setNewField('price', price)
            .setFieldValidations('price', [verifyNumber])
            .setNewField('stock', stock)
            .setFieldValidations('stock', [verifyNumber]) */
            .setNewField('seller_id', user_id)
            .setFieldValidations('seller_id', [verifyString])
            .validateFields()
            .build()

        if (productConfig.hayErrores) {
            return next(new AppError('Alguno de los campos ingresados tiene un formato invalido', 400, productConfig, 'VALIDAITON_ERROR'))
        }

        const new_product_data = {
            title: title,
            price: price,
            description: description,
            category: category,
            seller_id: user_id,
            stock: stock,
            image_base64: image_base64
        }

        const product = await ProductRepository.createProduct(new_product_data)

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(201)
            .setData({ productoCreado: product })
            .setMessage('Succes')
            .build()
        return res.status(201).json(response)
    }
    catch (error) {
        return next(error)
    }
}

export const getProductByIdController = async (req, res, next) => {
    try {
        const { product_id } = req.params

        if (!product_id) {
            return next(new AppError('Se necesita un product_id', 400, {}, "MISSING_PRODUCT_ID"))
        }

        const idValidation = new FieldConfig()
            .setNewField('product_id', product_id)
            .setFieldValidations('product_id', [verifyString])
            .validateFields()
            .build()

        if (idValidation.hayErrores) {
            return next(new AppError('El id del producto no tiene un formato valido', 400, {}, "VALIDATION_ERROR"))
        }

        const product = await ProductRepository.getById(product_id)

        if (!product) {
            //Puedo pasar a next el parametro para x middleware
            return next(new AppError('Producto no encontrado', 404, {}, "PRODUCT_NOT_FOUND"))
        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(201)
            .setData({ productoBuscado: product })
            .setMessage('Succes')
            .build()
        return res.status(201).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const deleteProductByIdController = async (req, res, next) => {
    try {
        const { product_id } = req.params

        if (!product_id) {
            return next(new AppError('No se ha recibido un id de producto', 400, {}, "MISSING_PRODUCT_ID"))
        }

        const idValidation = new FieldConfig()
            .setNewField('product_id', product_id)
            .setFieldValidations('product_id', [verifyString])
            .validateFields()
            .build()

        if (idValidation.hayErrores) {
            return next(new AppError('El id del producto no tiene un formato valido', 400, {}, "VALIDATION_ERROR"))
        }

        const product = await ProductRepository.deleteProduct(product_id)

        if (!product) {
            return next(new AppError('No se encontro el producto en la DB', 404, {}, 'PRODUCT_NOT_FOUND'))
        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(201)
            .setData({ productoBuscado: product })
            .setMessage('Succes')
            .build()
        return res.status(201).json(response)
    }
    catch (error) {
        next(error)
    }
}

export const updateProductByIdController = async (req, res, next) => {
    try {
        const { product_id } = req.params

        if (!product_id) {
            return next(new AppError('No se ha recibido un id de producto', 400, {}, "MISSING_PRODUCT_ID"))
        }

        const idValidation = new FieldConfig()
            .setNewField('product_id', product_id)
            .setFieldValidations('product_id', [verifyString])
            .validateFields()
            .build()

        if (idValidation.hayErrores) {
            return next(new AppError('El id del producto no tiene un formato valido', 400, {}, "VALIDATION_ERROR"))
        }

        const product = await ProductRepository.updateProduct(product_id, req.body)

        if (!product) {
            return next(new AppError('No se encontro el producto en la DB', 404, {}, 'PRODUCT_NOT_FOUND'))
        }

        const response = new ResponseBuilder()
            .setOk(true)
            .setStatus(200)
            .setData({ productoActualizado: product })
            .setMessage('Succes')
            .build()
        return res.status(200).json(response)
    }
    catch (error) {
        next(error)
    }
}