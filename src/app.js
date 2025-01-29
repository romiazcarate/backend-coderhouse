import express from 'express';
import productsRouter from './routes/productsRouter.js';
import cartsRouter from './routes/cartsRouter.js';

const app = express()
const PORT = 8080

// Middleware para parsear JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Middleware para registrar requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
})

// Uso de routers modularizados
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})