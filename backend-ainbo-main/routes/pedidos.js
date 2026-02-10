const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarToken } = require('../middleware/auth');

router.post('/crear-pedido', verificarToken, (req, res) => {
  const { direccion, cuponCodigo, items } = req.body;
  if (!direccion || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ mensaje: 'Datos de pedido inválidos' });
  }

  const usuarioId = req.usuario.Id;
  let total = 0;
  for (const it of items) {
    const c = Number(it.cantidad || 0);
    const p = Number(it.precio || 0);
    if (c <= 0 || p < 0 || !it.productoId) {
      return res.status(400).json({ mensaje: 'Ítems inválidos en el pedido' });
    }
    total += c * p;
  }

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ mensaje: 'Error iniciando transacción' });

    const qPedido = 'INSERT INTO Pedidos (UsuarioId, Total, Estado, Direccion, CuponCodigo) VALUES (?, ?, ?, ?, ?)';
    db.query(qPedido, [usuarioId, total, 'pendiente', direccion, cuponCodigo || null], (err, result) => {
      if (err) {
        db.rollback(() => {});
        return res.status(500).json({ mensaje: 'Error creando pedido' });
      }
      const pedidoId = result.insertId;

      const qDetalle = 'INSERT INTO DetallesPedido (PedidoId, ProductoId, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)';
      const inserts = items.map(it => [pedidoId, it.productoId, Number(it.cantidad), Number(it.precio)]);
      db.query(qDetalle, inserts[0], (err) => {
        if (err) {
          db.rollback(() => {});
          return res.status(500).json({ mensaje: 'Error creando detalle' });
        }
        const multiInsert = inserts.slice(1);
        const processNext = (i) => {
          if (i >= multiInsert.length) {
            db.commit(err => {
              if (err) {
                db.rollback(() => {});
                return res.status(500).json({ mensaje: 'Error confirmando pedido' });
              }
              return res.status(201).json({ mensaje: 'Pedido creado', pedidoId });
            });
            return;
          }
          db.query(qDetalle, multiInsert[i], (e) => {
            if (e) {
              db.rollback(() => {});
              return res.status(500).json({ mensaje: 'Error creando detalle' });
            }
            processNext(i + 1);
          });
        };
        processNext(0);
      });
    });
  });
});

router.get('/mis-pedidos', verificarToken, (req, res) => {
  const usuarioId = req.usuario.Id;
  const q = 'SELECT * FROM Pedidos WHERE UsuarioId = ? ORDER BY Id DESC';
  db.query(q, [usuarioId], (err, pedidos) => {
    if (err) return res.status(500).json({ mensaje: 'Error obteniendo pedidos' });
    return res.status(200).json({ pedidos });
  });
});

router.get('/pedido/:id', (req, res) => {
  const id = req.params.id;
  const qPedido = 'SELECT * FROM Pedidos WHERE Id = ?';
  const qDetalles = 'SELECT * FROM DetallesPedido WHERE PedidoId = ?';
  db.query(qPedido, [id], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error obteniendo pedido' });
    if (!rows || rows.length === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    const pedido = rows[0];
    db.query(qDetalles, [id], (e, dets) => {
      if (e) return res.status(500).json({ mensaje: 'Error obteniendo detalles' });
      return res.status(200).json({ pedido, detalles: dets || [] });
    });
  });
});

module.exports = router;
