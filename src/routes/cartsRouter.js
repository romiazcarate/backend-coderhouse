import express from 'express';
import fs from 'fs';

const router = express.Router();
const cartsFilePath = './data/carts.json'


router.use((req, res, next) => {
    console.log(`🛒 [CARRITOS] ${req.method} ${req.url}`)
    next()
});

// Función para obtener carritos desde el archivo JSON
const getCarts = () => {
    try {
        const data = fs.readFileSync(cartsFilePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        console.error('Error al leer carritos:', error)
        return []
    }
};

// POST /api/carts -> Crear un nuevo carrito
router.post('/', (req, res) => {
    let carts = getCarts()
    const newCart = { id: carts.length + 1, products: [] }

    carts.push(newCart)
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), 'utf-8')

    res.status(201).json({ mensaje: 'Carrito creado', carrito: newCart })
});

// GET /api/carts/:cid -> Obtener carrito por ID
router.get('/:cid', (req, res) => {
    const carts = getCarts()
    const cart = carts.find(c => c.id.toString() === req.params.cid)

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    res.json(cart)
});

// POST /api/carts/:cid/product/:pid -> Agregar producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    let carts = getCarts()
    const cart = carts.find(c => c.id.toString() === req.params.cid)

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' })
    }

    cart.products.push({ product: req.params.pid, quantity: 1 });
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2), 'utf-8')

    res.json({ mensaje: 'Producto agregado al carrito', carrito: cart })
});

export default router;
