const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Registrar los productos
router.post('/registrar-producto', (req, res) => {
    const { Nombre, Descripcion, Precio, Imagen, Stock = 0, Categoria } = req.body;

    // Validación
    if (!Nombre || !Descripcion || !Precio || !Imagen || !Categoria) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    const precioNumber = parseFloat(Precio);
    const stockNumber = parseInt(Stock);

    if (isNaN(precioNumber) || isNaN(stockNumber)) {
        return res.status(400).json({ message: 'Precio y Stock deben ser numéricos' });
    }

    // Consulta SQL actualizada
    const query = 'INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, Imagen, Categoria) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [Nombre, Descripcion, precioNumber, stockNumber, Imagen, Categoria], (err, result) => {
        if (err) {
            console.error('Error al registrar el producto:', err);
            return res.status(500).json({ message: 'Error al registrar el producto', error: err.message });
        }

        res.status(201).json({
            message: 'Producto registrado exitosamente',
            productId: result.insertId
        });
    });
});

router.get('/productos', (req, res) => {
    const query = 'SELECT * FROM Productos';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener productos:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Error al obtener productos'
            });
        }
        res.status(200).json({
            success: true,
            data: results
        });
    });
});

module.exports = router;
