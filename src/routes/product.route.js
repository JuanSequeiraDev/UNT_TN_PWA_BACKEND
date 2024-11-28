
import { Router } from "express"
import { createProductController, deleteProductByIdController, getAllProductsController, getProductByIdController, updateProductByIdController } from "../controllers/products.controller.js"
import authMiddleware from "../middlewares/auth.middleware.js"
const productRouter = Router()


productRouter.get('/:product_id', authMiddleware(['admin', 'user']), getProductByIdController)
productRouter.get('/', authMiddleware(['admin', 'user']) , getAllProductsController)
productRouter.post('/', authMiddleware(['admin']) , createProductController)
productRouter.put('/:product_id', authMiddleware(['admin']) , updateProductByIdController)
productRouter.delete('/:product_id', authMiddleware(['admin']), deleteProductByIdController)

export default productRouter