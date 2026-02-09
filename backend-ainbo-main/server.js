const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Cargar ruta
const authRoutes = require('./routes/auth');
const loginRoutes = require('./routes/login');
const productoRoutes = require('./routes/producto');
const passwordRoutes = require('./routes/password');

// Middleware para parsear el JSON
const loginRoutes = require('./routes/login');
const productoRoutes = require('./routes/producto');


//midlware para parsear el json
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS para permisos en el navegador
app.use(cors({
  origin: '*', 
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

// Inicialización del puerto
const PORT = process.env.PORT || 3306;

app.listen(PORT, () => {
  console.log(`Servidor escuchando ${PORT}`);
  console.log(`Api disponible en ${PORT}/api`);
});


module.exports = app;
