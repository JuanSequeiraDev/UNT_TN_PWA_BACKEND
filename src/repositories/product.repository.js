/* import Product from "../models/products.model.js";




//Capa logica de nuestra aplicacion para comunicar con la DB
class ProductRepository{
    static async createProduct ( new_product_data ) {
        const new_product = new Product(new_product_data)
        return await new_product.save()
    }

    static async updateProduct ( product_id, updated_data) {
        return Product.findByIdAndUpdate(product_id, updated_data)
    }

    static async getAllProducts ( ) {
        return Product.find({active: true})
    }

    static async getById (product_id ) {
        return Product.findById(product_id)
    }

    static async deleteProduct( product_id ) {
        //El {new: true} indica que debe devolver el producto actualizado
        return Product.findByIdAndDelete(product_id, {active: false}, {new: true})
    }
}

export default ProductRepository */

import pool from "../config/dbMysql.config.js"



//AL CAMBIAR DE DB TRATAR DE MATNENER SALIDA Y ENTRADAD DE DATOS EN LAS FUNCIONES DEL REPOSITORIO

class ProductRepository {
    static async createProduct(new_product_data) {
        const {
            title, // 'OR 1 == 1 DROP TABLE PRODUCTS'
            price,
            stock,
            description,
            seller_id,
            category,
            image_base64
        } = new_product_data

        const query = `
        INSERT INTO products (title, price, stock, description, seller_id, category, image_base64)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `

        const [result] = await pool.execute(query, [title, price, stock, description, seller_id, category, image_base64])
        if (result.affectedRows > 0) {
            return {
                title, price, stock, description, seller_id, category, image_base64, id: result.insertId
            }
        }
        else {
            //Podemos manejar el error
            return 'hola'
        }
    }

    static async updateProduct(product_id, updated_data) {
        const {
            title, // 'OR 1 == 1 DROP TABLE PRODUCTS'
            price,
            stock,
            description,
            seller_id,
            category,
            image_base64
        } = updated_data

        const dictionary ={

        }

        const values = []

        if(title){ 
            values.push(title) 
            dictionary.title = 'title = ?, '
        }
        if(price){ 
            values.push(price) 
            dictionary.price = 'price = ?, '
        }
        if(stock){
            values.push(stock) 
            dictionary.stock = 'stock = ?, '
            }
        if(description){
            values.push(description) 
            dictionary.description = 'description = ?, '
            }
        if(seller_id){
            values.push(seller_id) 
            dictionary.seller_id = 'seller_id = ?, '
            }
        if(category){ 
            values.push(category) 
            dictionary.category = 'category = ?, '
        }
        if(image_base64){ 
            values.push(image_base64)
            dictionary.image_base64 = 'image_base64 = ?, '
        }

        let spreadDictionary = ''

        for(let value in dictionary){
            spreadDictionary = spreadDictionary.concat(spreadDictionary, String(dictionary[value]))
        }

        values.push(product_id)

        await pool.execute(`
            UPDATE products SET ${spreadDictionary} active = true WHERE id = ?
            `, values)

            const [rows] = await pool.execute(`SELECT * FROM products WHERE id = ?`, [product_id])
            return rows
    }

    static async getAllProducts() {
        //Se obtiene un array con el [queryResult, columns]
        const [rows] = await pool.execute(`SELECT * FROM products WHERE active = true`)
        return rows
    }

    static async getById(product_id) {
        const [rows] = await pool.execute(`SELECT * FROM products WHERE id = ?`, [product_id])
        return rows.length > 0 ? rows[0] : null
    }

    static async deleteProduct(product_id) {
        //No deberia eliminar deberia actualizar
        //UPDATE <table_name> SET <column_name> = <new_value> WHERE condition
        await pool.execute(`
            UPDATE products SET active = false WHERE id = ?
            `, [product_id])

        const [rows] = await pool.execute(` SELECT * FROM products WHERE id = ?`, [product_id])
        return rows
    }
}

export default ProductRepository