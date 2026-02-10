const mysql = require('mysql2/promise');
require('dotenv').config();

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

const hostVar = DB_HOST || '127.0.0.1';
const userVar = DB_USERNAME || 'ainbo';
const passwordVar = DB_PASSWORD || '';
const dbVar = DB_NAME || 'AinboFloraBackend';
const portVar = Number(DB_PORT) || 3307;

const pool = mysql.createPool({
  host: hostVar,
  user: userVar,
  password: passwordVar,
  database: dbVar,
  port: portVar,
  waitForConnections: true,
  connectionLimit: 10,
});

// Mantener una conexión para compatibilidad con callbacks y transacciones sencillas
let connPromise = (async () => {
  const conn = await pool.getConnection();
  return conn;
})();

function query(sql, params, cb) {
  connPromise.then(async (conn) => {
    try {
      const [rows] = await conn.query(sql, params);
      if (typeof cb === 'function') cb(null, rows);
    } catch (err) {
      if (typeof cb === 'function') cb(err);
    }
  }).catch((e) => {
    if (typeof cb === 'function') cb(e);
  });
}

function beginTransaction(cb) {
  connPromise.then(async (conn) => {
    try {
      await conn.beginTransaction();
      if (typeof cb === 'function') cb(null);
    } catch (err) {
      if (typeof cb === 'function') cb(err);
    }
  }).catch((e) => {
    if (typeof cb === 'function') cb(e);
  });
}

function commit(cb) {
  connPromise.then(async (conn) => {
    try {
      await conn.commit();
      if (typeof cb === 'function') cb(null);
    } catch (err) {
      if (typeof cb === 'function') cb(err);
    }
  }).catch((e) => {
    if (typeof cb === 'function') cb(e);
  });
}

function rollback(cb) {
  connPromise.then(async (conn) => {
    try {
      await conn.rollback();
      if (typeof cb === 'function') cb(null);
    } catch (err) {
      if (typeof cb === 'function') cb(err);
    }
  }).catch((e) => {
    if (typeof cb === 'function') cb(e);
  });
}

module.exports = {
  query,
  beginTransaction,
  commit,
  rollback,
  pool,
};
