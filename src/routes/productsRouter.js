import express from 'express'
import fs from 'fs'

const router = express.Router()
const productsFilePath = './data/productos.json'

// Middleware para registrar cada request en este router
router.use((req, res, next) => {
    console.log(`📦 [PRODUCTOS] ${req.method} ${req.url}`)
    next()
})

// Función para obtener los productos desde el archivo JSON
const getProducts = () => {
    try {
        const data = fs.readFileSync(productsFilePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error al leer productos:', error)
        return [];
    }
}

// Función para guardar productos en el archivo JSON
const saveProducts = (products) => {
    try {
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), 'utf8')
    } catch (error) {
        console.error('Error al guardar productos:', error)
    }
}

// GET /api/products -> Listar todos los productos con ?limit opcional
router.get('/', (req, res) => {
    const products = getProducts()
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length
    
    if (isNaN(limit) || limit < 1) {
        return res.status(400).json({ error: 'El parámetro limit debe ser un número válido' })
    }

    res.json(products.slice(0, limit));
});
// GET /api/products/:pid -> Obtener un producto por su ID
router.get('/:pid', (req, res) => {
    const products = getProducts()
    const productId = req.params.pid
    const product = products.find(p => p.id.toString() === productId)

    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' })
    }

    res.json(product)
})

// POST /api/products -> Agregar un nuevo producto
router.post('/', (req, res) => {
    let products = getProducts()
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body

    if (!title || !description || !code || price === undefined || stock === undefined || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' })
    }

    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1

    const newProduct = {
        id: newId,
        title,
        description,
        code,
        price,
        status,
        stock,
        category,
        thumbnails
    };

    products.push(newProduct)
    saveProducts(products)

    res.status(201).json({ mensaje: 'Producto agregado con éxito', producto: newProduct })
})

// PUT /api/products/:pid -> Actualizar un producto
router.put('/:pid', (req, res) => {
    let products = getProducts()
    const pid = req.params.pid
    const updatedProduct = req.body

    const index = products.findIndex(p => p.id.toString() === pid)
    if (index === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' })
    }

    updatedProduct.id = products[index].id
    products[index] = { ...products[index], ...updatedProduct }
    saveProducts(products)

    res.json({ mensaje: 'Producto actualizado', producto: products[index] })
})

// DELETE /api/products/:pid -> Eliminar un producto
router.delete('/:pid', (req, res) => {
    let products = getProducts()
    const pid = req.params.pid

    const filteredProducts = products.filter(p => p.id.toString() !== pid)
    if (filteredProducts.length === products.length) {
        return res.status(404).json({ error: 'Producto no encontrado' })
    }

    saveProducts(filteredProducts)
    res.json({ mensaje: 'Producto eliminado correctamente' })
});

export default router
