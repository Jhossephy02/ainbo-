const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

// Cargar ruta
const authRoutes = require('./routes/auth');
const loginRoutes = require('./routes/login');
const productoRoutes = require('./routes/producto');
const passwordRoutes = require('./routes/password');
const pedidosRoutes = require('./routes/pedidos');

//midlware para parsear el json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// ruta princiapl 
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Servidor corriendo',
        Timestamp: new Date().toISOString(),
    });
});
//Ruta de api
app.get('/api', (req, res) =>{
 res.json({
  mensaje:'API funcionando',
  enpoints:['POST api/login','POST api/registro','POST api/login/google']
 });
});

// Rutas
app.use('/api', authRoutes);
app.use('/api', loginRoutes);
app.use('/api', productoRoutes);
app.use('/api', passwordRoutes);
app.use('/api', pedidosRoutes);

// Inicialización del puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando ${PORT}`);
  console.log(`Api disponible en ${PORT}/api`);
  db.query('CREATE TABLE IF NOT EXISTS Usuarios (Id INT AUTO_INCREMENT PRIMARY KEY, Nombre VARCHAR(100) NOT NULL, Apellido VARCHAR(100) NOT NULL, Email VARCHAR(150) NOT NULL UNIQUE, NumeroCelular VARCHAR(20), Contraseña VARCHAR(255), Rol ENUM("usuario","admin") DEFAULT "usuario", nombre_usuario VARCHAR(100), correo VARCHAR(150), fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP, auth_provider VARCHAR(50), firebase_uid VARCHAR(100), email_verified TINYINT(1) DEFAULT 0, reset_token VARCHAR(64), reset_token_expiry BIGINT) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS Productos (Id INT AUTO_INCREMENT PRIMARY KEY, Nombre VARCHAR(150) NOT NULL, Descripcion VARCHAR(500), Precio DECIMAL(10,2) NOT NULL, Stock INT NOT NULL DEFAULT 0, Imagen VARCHAR(255), Categoria VARCHAR(100)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS Pedidos (Id INT AUTO_INCREMENT PRIMARY KEY, NumeroOrden VARCHAR(20) UNIQUE, UsuarioId INT NOT NULL, Total DECIMAL(10,2) NOT NULL, Estado VARCHAR(32) NOT NULL, Direccion VARCHAR(255), CuponCodigo VARCHAR(64), PaymentMethod VARCHAR(20), PaymentStatus VARCHAR(20), PagoCodigo VARCHAR(32), Fecha DATETIME DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS DetallesPedido (Id INT AUTO_INCREMENT PRIMARY KEY, PedidoId INT NOT NULL, ProductoId INT NOT NULL, Cantidad INT NOT NULL, PrecioUnitario DECIMAL(10,2) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS EstadosPedido (Id INT AUTO_INCREMENT PRIMARY KEY, PedidoId INT NOT NULL, Estado VARCHAR(32) NOT NULL, Fecha DATETIME DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci', [], () => {});
  db.query('ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Rol ENUM("usuario","admin") DEFAULT "usuario"', [], () => {});
  const ensureConstraint = (table, name, alter) => {
    const q = 'SELECT 1 FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? LIMIT 1';
    db.query(q, [table, name], (err, rows) => {
      if (err) return;
      if (!rows || rows.length === 0) db.query(alter, [], () => {});
    });
  };
  const ensureIndex = (table, name, alter) => {
    const q = 'SELECT 1 FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1';
    db.query(q, [table, name], (err, rows) => {
      if (err) return;
      if (!rows || rows.length === 0) db.query(alter, [], () => {});
    });
  };
  ensureIndex('Usuarios', 'idx_usuarios_correo', 'ALTER TABLE Usuarios ADD INDEX idx_usuarios_correo (correo)');
  ensureIndex('Productos', 'idx_productos_nombre', 'ALTER TABLE Productos ADD INDEX idx_productos_nombre (Nombre)');
  ensureIndex('Productos', 'idx_productos_categoria', 'ALTER TABLE Productos ADD INDEX idx_productos_categoria (Categoria)');
  ensureIndex('Pedidos', 'idx_pedidos_usuario', 'ALTER TABLE Pedidos ADD INDEX idx_pedidos_usuario (UsuarioId)');
  ensureIndex('DetallesPedido', 'idx_detalles_pedido', 'ALTER TABLE DetallesPedido ADD INDEX idx_detalles_pedido (PedidoId)');
  ensureIndex('DetallesPedido', 'idx_detalles_producto', 'ALTER TABLE DetallesPedido ADD INDEX idx_detalles_producto (ProductoId)');
  ensureIndex('EstadosPedido', 'idx_estados_pedido', 'ALTER TABLE EstadosPedido ADD INDEX idx_estados_pedido (PedidoId)');
  ensureConstraint('Pedidos', 'fk_pedidos_usuario', 'ALTER TABLE Pedidos ADD CONSTRAINT fk_pedidos_usuario FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id) ON DELETE CASCADE');
  ensureConstraint('DetallesPedido', 'fk_detalles_pedido', 'ALTER TABLE DetallesPedido ADD CONSTRAINT fk_detalles_pedido FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id) ON DELETE CASCADE');
  ensureConstraint('DetallesPedido', 'fk_detalles_producto', 'ALTER TABLE DetallesPedido ADD CONSTRAINT fk_detalles_producto FOREIGN KEY (ProductoId) REFERENCES Productos(Id) ON DELETE RESTRICT');
  ensureConstraint('EstadosPedido', 'fk_estados_pedido', 'ALTER TABLE EstadosPedido ADD CONSTRAINT fk_estados_pedido FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id) ON DELETE CASCADE');
  db.query('SELECT COUNT(1) AS c FROM Productos', [], (err, rows) => {
    if (err) return;
    const c = (rows && rows[0] && rows[0].c) || 0;
    if (c > 0) return;
    const seed = [
      ['Macetero Moderno Blanco', 'Elegante macetero de cerámica resistente a exteriores.', 35.00, 50, 'img/Ceramica2.jpg', 'Maceteros'],
      ['Kit de Suculentas', 'Set de 3 suculentas variadas con macetas decorativas.', 45.00, 30, 'img/verdes.jpg', 'Plantas'],
      ['Semillas de Lavanda', 'Semillas de alta germinación para cultivo de lavanda.', 15.00, 100, 'img/Semilla2.jpg', 'Semillas'],
      ['Set de Herramientas Mini', 'Kit de 3 herramientas para plantas de interior.', 28.00, 40, 'img/Herramienta4.jpg', 'Herramientas']
    ];
    const q = 'INSERT INTO Productos (Nombre, Descripcion, Precio, Stock, Imagen, Categoria) VALUES (?, ?, ?, ?, ?, ?)';
    const insertNext = (i) => {
      if (i >= seed.length) return;
      db.query(q, seed[i], () => insertNext(i + 1));
    };
    insertNext(0);
  });
  db.query('SELECT COUNT(1) AS c FROM Usuarios WHERE Rol="admin"', [], async (err, rows) => {
    if (err) return;
    const c = (rows && rows[0] && rows[0].c) || 0;
    if (c > 0) return;
    try {
      const hash = await bcrypt.hash('admin123', 10);
      db.query('INSERT INTO Usuarios (Nombre, Apellido, Email, NumeroCelular, Contraseña, Rol) VALUES (?, ?, ?, ?, ?, "admin")',
        ['Admin', 'Ainbo', 'admin@ainbo.test', '999999999', hash],
        () => console.log('Admin bootstrap creado: admin@ainbo.test'));
    } catch {}
  });
});
