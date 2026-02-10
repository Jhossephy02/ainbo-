const mysql = require('mysql2');
require('dotenv').config();

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

function ensureSchema(cb) {
  const conn = mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    port: DB_PORT,
    multipleStatements: true,
  });
  const ddl = `
    CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    USE \`${DB_NAME}\`;
    CREATE TABLE IF NOT EXISTS Usuarios (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      Nombre VARCHAR(100),
      Apellido VARCHAR(100),
      Email VARCHAR(150) UNIQUE,
      NumeroCelular VARCHAR(20),
      Contraseña VARCHAR(255),
      nombre_usuario VARCHAR(100),
      firebase_uid VARCHAR(100),
      auth_provider VARCHAR(50),
      email_verified TINYINT DEFAULT 0,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS Productos (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      Nombre VARCHAR(150),
      Descripcion TEXT,
      Precio DECIMAL(10,2),
      Stock INT DEFAULT 0,
      Imagen VARCHAR(255),
      Categoria VARCHAR(100)
    );
    CREATE TABLE IF NOT EXISTS Pedidos (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      UsuarioId INT NOT NULL,
      Total DECIMAL(10,2),
      Estado VARCHAR(50) DEFAULT 'pendiente',
      Direccion VARCHAR(255),
      CuponCodigo VARCHAR(50),
      Fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX (UsuarioId)
    );
    CREATE TABLE IF NOT EXISTS DetallesPedido (
      Id INT AUTO_INCREMENT PRIMARY KEY,
      PedidoId INT NOT NULL,
      ProductoId INT NOT NULL,
      Cantidad INT NOT NULL,
      PrecioUnitario DECIMAL(10,2) NOT NULL,
      INDEX (PedidoId),
      INDEX (ProductoId)
    );
  `;
  conn.query(ddl, (err) => {
    conn.end();
    cb(err);
  });
}

let pool = null;
ensureSchema((err) => {
  if (err) {
    console.error('Error asegurando el esquema:', err.message);
    return;
  }
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  pool.query('SELECT 1', (e) => {
    if (e) {
      console.error('Error conectando a la base de datos:', e.message);
    } else {
      console.log('Conectado a la base de datos');
    }
  });
});

module.exports = new Proxy({}, {
  get(_, prop) {
    if (!pool) throw new Error('La conexión a BD aún no está lista');
    return pool[prop];
  }
});
