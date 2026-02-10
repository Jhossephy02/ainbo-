const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarToken, verificarAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

router.post('/crear-pedido', verificarToken, (req, res) => {
  const { direccion, cuponCodigo, items, metodoPago, pagoDatos } = req.body;
  if (!direccion || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ mensaje: 'Datos de pedido inválidos' });
  }
  const metodo = String(metodoPago || '').toLowerCase();
  if (!['tarjeta','yape','pagoefectivo'].includes(metodo)) {
    return res.status(400).json({ mensaje: 'Método de pago inválido' });
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

  const numeroOrden = `ABF-${crypto.randomInt(100000, 999999)}`;
  let pagoCodigo = null;
  let pagoEstado = 'pendiente';
  if (metodo === 'pagoefectivo') {
    pagoCodigo = `CIP-${crypto.randomInt(10000000, 99999999)}`;
  } else if (metodo === 'yape') {
    pagoCodigo = `YAPE-${crypto.randomInt(100000, 999999)}`;
  } else if (metodo === 'tarjeta') {
    pagoEstado = 'aprobado';
  }

  db.beginTransaction(err => {
    if (err) return res.status(500).json({ mensaje: 'Error iniciando transacción' });

    const qCrearPedidos = 'CREATE TABLE IF NOT EXISTS Pedidos (Id INT AUTO_INCREMENT PRIMARY KEY, NumeroOrden VARCHAR(20) UNIQUE, UsuarioId INT NOT NULL, Total DECIMAL(10,2) NOT NULL, Estado VARCHAR(32) NOT NULL, Direccion VARCHAR(255), CuponCodigo VARCHAR(64), PaymentMethod VARCHAR(20), PaymentStatus VARCHAR(20), PagoCodigo VARCHAR(32), Fecha DATETIME DEFAULT CURRENT_TIMESTAMP)';
    const qCrearDetalles = 'CREATE TABLE IF NOT EXISTS DetallesPedido (Id INT AUTO_INCREMENT PRIMARY KEY, PedidoId INT NOT NULL, ProductoId INT NOT NULL, Cantidad INT NOT NULL, PrecioUnitario DECIMAL(10,2) NOT NULL)';
    db.query(qCrearPedidos, [], () => {
      db.query(qCrearDetalles, [], () => {
        db.query('CREATE TABLE IF NOT EXISTS EstadosPedido (Id INT AUTO_INCREMENT PRIMARY KEY, PedidoId INT NOT NULL, Estado VARCHAR(32) NOT NULL, Fecha DATETIME DEFAULT CURRENT_TIMESTAMP)', [], () => {
        const qPedido = 'INSERT INTO Pedidos (NumeroOrden, UsuarioId, Total, Estado, Direccion, CuponCodigo, PaymentMethod, PaymentStatus, PagoCodigo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(qPedido, [numeroOrden, usuarioId, total, 'pendiente', direccion, cuponCodigo || null, metodo, pagoEstado, pagoCodigo], (err, result) => {
      if (err) {
        db.rollback(() => {});
        return res.status(500).json({ mensaje: 'Error creando pedido' });
      }
      const pedidoId = result.insertId;
        db.query('INSERT INTO EstadosPedido (PedidoId, Estado) VALUES (?, ?)', [pedidoId, 'pendiente'], (eIns) => {
          if (eIns) {
            db.rollback(() => {});
            return res.status(500).json({ mensaje: 'Error guardando estado' });
          }

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
              // Reducir stock
              const reducir = () => {
                const next = (idx) => {
                  if (idx >= items.length) return db.commit(async (err) => {
                    if (err) {
                      db.rollback(() => {});
                      return res.status(500).json({ mensaje: 'Error confirmando pedido' });
                    }
                    try {
                      const [user] = await new Promise((resolve) => {
                        db.query('SELECT Email, Nombre FROM Usuarios WHERE Id = ?', [usuarioId], (e, rows) => resolve(rows || []));
                      });
                      const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS?.replace(/\"/g, '') }
                      });
                      const to = (user && user.Email) || '';
                      if (to) {
                        await transporter.sendMail({
                          from: process.env.SMTP_USER,
                          to,
                          subject: `Confirmación de pedido ${numeroOrden}`,
                          html: `<h3>Gracias por tu compra</h3><p>Tu número de orden es <strong>${numeroOrden}</strong>.</p><p>Total: S/. ${total.toFixed(2)}</p><p>Método de pago: <strong>${metodo}</strong></p>${pagoCodigo ? `<p>Tu código de pago: <strong>${pagoCodigo}</strong></p>` : ''}`
                        });
                      }
                    } catch {}
                    return res.status(201).json({ mensaje: 'Pedido creado', pedidoId, numeroOrden, metodoPago: metodo, cip: pagoCodigo });
                  });
                  const it = items[idx];
                  if (pagoEstado !== 'aprobado') {
                    return next(idx + 1);
                  }
                  db.query('UPDATE Productos SET Stock = GREATEST(Stock - ?, 0) WHERE Id = ?', [Number(it.cantidad), it.productoId], (e) => {
                    if (e) {
                      db.rollback(() => {});
                      return res.status(500).json({ mensaje: 'Error actualizando stock' });
                    }
                    next(idx + 1);
                  });
                };
                next(0);
              };
              reducir();
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

router.get('/seguimiento/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  const qPedido = 'SELECT * FROM Pedidos WHERE NumeroOrden = ?';
  const qDetalles = 'SELECT * FROM DetallesPedido WHERE PedidoId = ?';
  db.query(qPedido, [codigo], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error obteniendo pedido' });
    if (!rows || rows.length === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    const pedido = rows[0];
    db.query(qDetalles, [pedido.Id], (e, dets) => {
      if (e) return res.status(500).json({ mensaje: 'Error obteniendo detalles' });
      db.query('SELECT Estado, Fecha FROM EstadosPedido WHERE PedidoId = ? ORDER BY Fecha ASC', [pedido.Id], (eh, hist) => {
        if (eh) return res.status(500).json({ mensaje: 'Error obteniendo historial' });
        return res.status(200).json({ pedido, detalles: dets || [], historial: hist || [] });
      });
    });
  });
});

// Resumen de ventas (solo admin)
router.get('/admin/ventas/totales', verificarToken, verificarAdmin, (req, res) => {
  const q = 'SELECT COUNT(*) AS pedidos, COALESCE(SUM(Total),0) AS ingresos FROM Pedidos';
  db.query(q, [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error obteniendo totales' });
    return res.status(200).json(rows[0] || { pedidos: 0, ingresos: 0 });
  });
});

router.get('/admin/ventas/metodos', verificarToken, verificarAdmin, (req, res) => {
  const q = 'SELECT PaymentMethod AS metodo, COUNT(*) AS pedidos, COALESCE(SUM(Total),0) AS ingresos FROM Pedidos GROUP BY PaymentMethod';
  db.query(q, [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error obteniendo resumen por método' });
    return res.status(200).json({ resumen: rows || [] });
  });
});

// Listado de pedidos (solo admin)
router.get('/admin/pedidos', verificarToken, verificarAdmin, (req, res) => {
  const q = 'SELECT P.Id, P.NumeroOrden, P.UsuarioId, U.Nombre, U.Email, P.Total, P.Estado, P.PaymentMethod, P.PaymentStatus, P.PagoCodigo FROM Pedidos P LEFT JOIN Usuarios U ON U.Id = P.UsuarioId ORDER BY P.Id DESC';
  db.query(q, [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error listando pedidos' });
    return res.status(200).json({ pedidos: rows || [] });
  });
});

// Webhooks de pago Culqi
router.post('/webhooks/culqi', (req, res) => {
  const payload = req.body || {};
  const numeroOrden = String(payload.numeroOrden || '');
  const status = String(payload.status || '').toLowerCase();
  if (!numeroOrden) return res.status(400).json({ mensaje: 'Sin orden' });
  const aprobado = status === 'success' || status === 'aprobado' || status === 'approved';
  db.query('SELECT * FROM Pedidos WHERE NumeroOrden=?', [numeroOrden], (e, rows) => {
    if (e || !rows || rows.length === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    const pedido = rows[0];
    const nuevoEstado = aprobado ? 'aprobado' : 'rechazado';
    db.query('UPDATE Pedidos SET PaymentStatus=? WHERE Id=?', [nuevoEstado, pedido.Id], (eu) => {
      if (eu) return res.status(500).json({ mensaje: 'Error actualizando estado' });
      if (!aprobado) return res.status(200).json({ mensaje: 'Actualizado' });
      db.query('SELECT ProductoId, Cantidad FROM DetallesPedido WHERE PedidoId=?', [pedido.Id], (ed, dets) => {
        if (ed) return res.status(500).json({ mensaje: 'Error obteniendo detalles' });
        const next = (i) => {
          if (i >= (dets || []).length) return res.status(200).json({ mensaje: 'Confirmado y stock actualizado' });
          const d = dets[i];
          db.query('UPDATE Productos SET Stock = GREATEST(Stock - ?, 0) WHERE Id=?', [Number(d.Cantidad), d.ProductoId], () => next(i + 1));
        };
        next(0);
      });
    });
  });
});

// Webhooks de pago Mercado Pago
router.post('/webhooks/mercadopago', (req, res) => {
  const payload = req.body || {};
  const numeroOrden = String(payload.external_reference || payload.numeroOrden || '');
  const status = String(payload.status || '').toLowerCase();
  if (!numeroOrden) return res.status(400).json({ mensaje: 'Sin orden' });
  const aprobado = status === 'approved' || status === 'success' || status === 'aprobado';
  db.query('SELECT * FROM Pedidos WHERE NumeroOrden=?', [numeroOrden], (e, rows) => {
    if (e || !rows || rows.length === 0) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    const pedido = rows[0];
    const nuevoEstado = aprobado ? 'aprobado' : 'rechazado';
    db.query('UPDATE Pedidos SET PaymentStatus=? WHERE Id=?', [nuevoEstado, pedido.Id], (eu) => {
      if (eu) return res.status(500).json({ mensaje: 'Error actualizando estado' });
      if (!aprobado) return res.status(200).json({ mensaje: 'Actualizado' });
      db.query('SELECT ProductoId, Cantidad FROM DetallesPedido WHERE PedidoId=?', [pedido.Id], (ed, dets) => {
        if (ed) return res.status(500).json({ mensaje: 'Error obteniendo detalles' });
        const next = (i) => {
          if (i >= (dets || []).length) return res.status(200).json({ mensaje: 'Confirmado y stock actualizado' });
          const d = dets[i];
          db.query('UPDATE Productos SET Stock = GREATEST(Stock - ?, 0) WHERE Id=?', [Number(d.Cantidad), d.ProductoId], () => next(i + 1));
        };
        next(0);
      });
    });
  });
});

// Inventario crítico
router.get('/admin/inventario/critico', verificarToken, verificarAdmin, (req, res) => {
  db.query('SELECT Id, Nombre, Stock, Categoria FROM Productos WHERE Stock < 3 ORDER BY Stock ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: 'Error obteniendo inventario' });
    res.status(200).json({ productos: rows || [] });
  });
});

module.exports = router;
