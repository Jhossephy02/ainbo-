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
  db.query('CREATE TABLE IF NOT EXISTS Usuarios (Id INT AUTO_INCREMENT PRIMARY KEY, Nombre VARCHAR(100), Apellido VARCHAR(100), Email VARCHAR(150) UNIQUE, NumeroCelular VARCHAR(20), Contraseña VARCHAR(255), Rol ENUM("usuario","admin") DEFAULT "usuario", nombre_usuario VARCHAR(100), correo VARCHAR(150), fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP, auth_provider VARCHAR(50), firebase_uid VARCHAR(100), email_verified TINYINT(1) DEFAULT 0, reset_token VARCHAR(64), reset_token_expiry BIGINT)', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS Productos (Id INT AUTO_INCREMENT PRIMARY KEY, Nombre VARCHAR(150) NOT NULL, Descripcion VARCHAR(500), Precio DECIMAL(10,2) NOT NULL, Stock INT NOT NULL DEFAULT 0, Imagen VARCHAR(255), Categoria VARCHAR(100))', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS Pedidos (Id INT AUTO_INCREMENT PRIMARY KEY, NumeroOrden VARCHAR(20) UNIQUE, UsuarioId INT NOT NULL, Total DECIMAL(10,2) NOT NULL, Estado VARCHAR(32) NOT NULL, Direccion VARCHAR(255), CuponCodigo VARCHAR(64), PaymentMethod VARCHAR(20), PaymentStatus VARCHAR(20), PagoCodigo VARCHAR(32), Fecha DATETIME DEFAULT CURRENT_TIMESTAMP)', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS DetallesPedido (Id INT AUTO_INCREMENT PRIMARY KEY, PedidoId INT NOT NULL, ProductoId INT NOT NULL, Cantidad INT NOT NULL, PrecioUnitario DECIMAL(10,2) NOT NULL)', [], () => {});
  db.query('CREATE TABLE IF NOT EXISTS EstadosPedido (Id INT AUTO_INCREMENT PRIMARY KEY, PedidoId INT NOT NULL, Estado VARCHAR(32) NOT NULL, Fecha DATETIME DEFAULT CURRENT_TIMESTAMP)', [], () => {});
  db.query('ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Rol ENUM("usuario","admin") DEFAULT "usuario"', [], () => {});
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
