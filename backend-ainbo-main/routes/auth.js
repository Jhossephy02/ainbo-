const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Ruta para registro normal
router.post('/registro', async (req, res) => {
    console.log('Registro de usuario:', req.body);
    console.log( req.body);
    // Desestructuración de los datos del cuerpo de la solicitud
    const { Nombre, Apellido, Email, NumeroCelular, Contraseña } = req.body;

    if (!Nombre || !Apellido || !Email || !NumeroCelular || !Contraseña) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const hash = await bcrypt.hash(Contraseña, 10);
        const query = 'INSERT INTO Usuarios (Nombre, Apellido, Email, NumeroCelular, Contraseña) VALUES (?, ?, ?, ?, ?)';

        db.query(query, [Nombre, Apellido, Email, NumeroCelular, hash], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al registrar el usuario', error: err.message });
            }
            res.status(201).json({ 
                message: 'Usuario registrado exitosamente',
                userId: result.insertId
            });
            
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Error al registrar el usuario', error: err.message});
    }
});

// Ruta para registro con Google
router.post('/registro-google', async (req, res) => {
    const { nombre_usuario, Email } = req.body;

    if (!nombre_usuario || !Email) {
        return res.status(400).json({ message: 'Nombre de usuario y Email son obligatorios' });
    }

    const uid = `test_uid_${Date.now()}`;

    const query = 'INSERT INTO Usuarios (firebase_uid, nombre_usuario, Email, auth_provider, email_verified, fecha_registro) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [uid, nombre_usuario, Email, 'google', true, new Date()];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error al crear usuario de Google', err);
            return res.status(500).json({ error: err.message });
        }

        console.log('Usuario creado con éxito', result.insertId);
        res.json({
            success: true,
            message: 'Usuario de Google creado con éxito',
            user: {
                id: result.insertId,
                firebase_uid: uid,
                nombre_usuario: nombre_usuario,
                Email: Email,
                auth_provider: 'google'
            }
        });
    });
});

module.exports = router;
