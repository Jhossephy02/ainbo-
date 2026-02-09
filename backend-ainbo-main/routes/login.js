const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

router.post('/login', (req, res) => {
    console.log(req.body);
    const {Email, Contraseña} = req.body;

    // Validación de datos
    if(!Email || !Contraseña) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Buscar el usuario en la base de datos
    db.query('SELECT * FROM Usuarios WHERE Email = ?',
        [Email], // Corregido: eliminado el !
        async (err, results) => {
            if(err) {
                console.log(err);
                return res.status(500).send('Error en el servidor');
            }

            if(results.length === 0) {
                return res.status(404).send('Usuario no encontrado');
            }

            const usuario = results[0]; // Cambiado de Email a usuario para mayor claridad

            // Comparar la contraseña
            const match = await bcrypt.compare(Contraseña, usuario.Contraseña);

            if(!match) {
                return res.status(401).send('Contraseña incorrecta');
            }

            return res.status(200).send({
                mensaje: 'Usuario logueado exitosamente',
                Usuario: {
                    Id: usuario.Id, // Asegúrate de que coincida con el nombre de columna en tu DB
                    Nombre: usuario.Nombre,
                    Email: usuario.Email,
                    Contraseña: usuario.Contraseña
                }
            });
        }
    );
});


router.post('/login/google', async (req, res) => {
 const { nombre_usuario, correo, firebase_uid, email_verified } = req.body;
 if (!correo || !firebase_uid) {
  return res.status(400).send('Faltan datos obligatorios');

 }

 db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {

  if (err) {

   console.error('Error en consulta:', err);

   return res.status(500).send('Error en el servidor');

  }
  if (results.length === 0) {
   // Usuario no existe, lo registramos
   const insertQuery = `
    INSERT INTO usuarios (nombre_usuario, correo, fecha_registro, auth_provider, firebase_uid, email_verified)
    VALUES (?, ?, NOW(), 'google', ?, ?)
   `;
   db.query(insertQuery, [nombre_usuario, correo, firebase_uid, email_verified ? 1 : 0], (err, result) => {

    if (err) {

     console.error('Error al insertar usuario Google:', err);

     return res.status(500).send('Error al registrar usuario');

    }



    return res.status(201).json({

     mensaje: 'Usuario registrado con Google',

     usuario: {

      id: result.insertId,

      nombre_usuario,

      correo,

      auth_provider: 'google'

     }

    });

   });

  } else {

   // Usuario ya existe

   return res.status(200).json({

    mensaje: 'Login con Google exitoso',

    usuario: results[0]

   });

  }

 });

});

module.exports = router;
