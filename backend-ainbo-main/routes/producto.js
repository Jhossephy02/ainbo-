const express = require('express');
const router = express.Router();
const db = require('../config/db');

const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Registrar los productos (solo admin)
router.post('/registrar-producto', verificarToken, verificarAdmin, (req, res) => {
    const { Nombre, Descripcion, Precio, Imagen, Stock = 0, Categoria, Luz, Riego, PetFriendly, ImagenWhite, ImagenAmbient } = req.body;

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
    const query = 'INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, Imagen, Categoria, Luz, Riego, PetFriendly, ImagenWhite, ImagenAmbient) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [Nombre, Descripcion, precioNumber, stockNumber, Imagen, Categoria, Luz || null, Riego || null, PetFriendly ? 1 : 0, ImagenWhite || null, ImagenAmbient || null], (err, result) => {
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
    const redis = req.app.locals.redis;
    const cacheKey = 'productos_all';
    const sendData = (rows) => res.status(200).json({ success: true, data: rows });
    if (redis) {
      redis.get(cacheKey).then(cached => {
        if (cached) {
          try { return sendData(JSON.parse(cached)); } catch {}
        }
        db.query(query, (err, results) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error al obtener productos' });
          }
          sendData(results);
          redis.set(cacheKey, JSON.stringify(results), { EX: 60 }).catch(() => {});
        });
      }).catch(() => {
        db.query(query, (err, results) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Error al obtener productos' });
          }
          sendData(results);
        });
      });
    } else {
      db.query(query, (err, results) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error al obtener productos' });
        }
        sendData(results);
      });
    }
});

// Seed inicial de productos si la tabla está vacía
const aplicarSeed = (req, res) => {
    db.query('SELECT COUNT(1) AS c FROM Productos', [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Error verificando productos' });
        const count = (rows && rows[0] && rows[0].c) || 0;
        if (count > 0) {
            return res.status(409).json({ message: 'Ya existen productos, seed no aplicado' });
        }
        const productos = [
            ['Macetero Rústico', 'Terracota natural con acabado artesanal', 30.00, 50, 'img/Ceramica1.jpg', 'Maceteros'],
            ['Macetero Minimalista', 'Diseño blanco mate contemporáneo', 25.00, 40, 'img/Ceramica2.jpg', 'Maceteros'],
            ['Macetero Artesanal', 'Hecho a mano con acabados únicos', 35.00, 25, 'img/Ceramica7.jpg', 'Maceteros'],
            ['Planta Decorativa', 'Planta de interior resistente', 20.00, 60, 'img/Flor en 4k.jpg', 'Plantas'],
            ['Kit Suculentas', 'Set de 3 suculentas variadas', 45.00, 30, 'img/verdes.jpg', 'Plantas'],
            ['Semillas Tomate Cherry', 'Alta germinación, incluye guía', 15.00, 100, 'img/Semilla1.jpg', 'Semillas'],
            ['Semillas Mix Hierbas', 'Cinco variedades culinarias', 15.00, 120, 'img/image 14.jpg', 'Semillas'],
            ['Tijeras Premium', 'Acero inoxidable de alta resistencia', 15.00, 70, 'img/Herramienta3.jpg', 'Herramientas'],
            ['Regadera Vintage', 'Metal con acabado decorativo', 10.00, 80, 'img/riego.jpg', 'Herramientas'],
            ['Guantes Jardinería', 'Resistentes y cómodos', 20.00, 90, 'img/Herramientas1.jpg', 'Herramientas']
        ];
        const q = 'INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, Imagen, Categoria) VALUES (?, ?, ?, ?, ?, ?)';
        const insertar = (i) => {
            if (i >= productos.length) {
                return res.status(201).json({ message: 'Seed aplicado', insertados: productos.length });
            }
            db.query(q, productos[i], (e) => {
                if (e) return res.status(500).json({ message: 'Error insertando producto', error: e.message, index: i });
                insertar(i + 1);
            });
        };
        insertar(0);
    });
};
router.post('/seed-productos', aplicarSeed);
router.get('/seed-productos', aplicarSeed);

// Actualizar producto (solo admin)
router.put('/admin/productos/:id', verificarToken, verificarAdmin, (req, res) => {
    const id = req.params.id;
    const { Nombre, Descripcion, Precio, Imagen, Stock, Categoria, Luz, Riego, PetFriendly, ImagenWhite, ImagenAmbient } = req.body;
    const q = 'UPDATE Productos SET Nombre=?, Descripcion=?, Precio=?, Stock=?, Imagen=?, Categoria=?, Luz=?, Riego=?, PetFriendly=?, ImagenWhite=?, ImagenAmbient=? WHERE Id=?';
    db.query(q, [Nombre, Descripcion, Number(Precio), Number(Stock), Imagen, Categoria, Luz || null, Riego || null, PetFriendly ? 1 : 0, ImagenWhite || null, ImagenAmbient || null, id], (err) => {
        if (err) return res.status(500).json({ message: 'Error actualizando producto' });
        res.status(200).json({ message: 'Producto actualizado' });
    });
});

// Eliminar producto (solo admin)
router.delete('/admin/productos/:id', verificarToken, verificarAdmin, (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM Productos WHERE Id=?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error eliminando producto' });
        res.status(200).json({ message: 'Producto eliminado' });
    });
});

module.exports = router;
