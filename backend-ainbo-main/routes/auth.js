const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

// Ruta para registro normal
router.post('/registro', async (req, res) => {
    const { Nombre, Apellido, Email, NumeroCelular, Contraseña } = req.body;
    if (!Nombre || !Apellido || !Email || !NumeroCelular || !Contraseña) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    const emailOk = typeof Email === 'string' && Email.includes('@') && Email.includes('.');
    if (!emailOk) {
        return res.status(400).json({ message: 'Email inválido' });
    }
    const telStr = String(NumeroCelular || '').replace(/\D/g, '');
    if (telStr.length < 7 || telStr.length > 15) {
        return res.status(400).json({ message: 'Número de celular inválido' });
    }
    if (String(Contraseña).length < 6) {
        return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    try {
        db.query('ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Rol ENUM("usuario","admin") DEFAULT "usuario"', [], () => {});
        db.query('SELECT Id FROM Usuarios WHERE Email = ?', [Email], async (err, rows) => {
            if (err) return res.status(500).json({ message: 'Error validando usuario' });
            if (rows && rows.length > 0) {
                return res.status(409).json({ message: 'Email ya registrado' });
            }
            const hash = await bcrypt.hash(Contraseña, 10);
            const query = 'INSERT INTO Usuarios (Nombre, Apellido, Email, NumeroCelular, Contraseña, Rol) VALUES (?, ?, ?, ?, ?, "usuario")';
            db.query(query, [Nombre, Apellido, Email, telStr, hash], (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Error al registrar el usuario', error: err.message });
                }
                res.status(201).json({ 
                    message: 'Usuario registrado exitosamente',
                    userId: result.insertId
                });
            });
        });
    } catch (err) {
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

    db.query('ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Rol ENUM("usuario","admin") DEFAULT "usuario"', [], () => {});
    const query = 'INSERT INTO Usuarios (firebase_uid, nombre_usuario, Email, auth_provider, email_verified, fecha_registro, Rol) VALUES (?, ?, ?, ?, ?, ?, "usuario")';
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

// Bootstrap de admin: crea un admin por única vez si no existen
router.post('/bootstrap-admin', async (req, res) => {
    try {
        db.query('ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Rol ENUM("usuario","admin") DEFAULT "usuario"', [], () => {});
        db.query('SELECT COUNT(1) AS c FROM Usuarios WHERE Rol="admin"', [], async (err, rows) => {
            if (err) return res.status(500).json({ message: 'Error verificando admins' });
            const count = (rows && rows[0] && rows[0].c) || 0;
            if (count > 0) {
                return res.status(409).json({ message: 'Ya existe al menos un administrador' });
            }
            const Nombre = 'Admin';
            const Apellido = 'Ainbo';
            const Email = 'admin@ainbo.test';
            const NumeroCelular = '999999999';
            const Contraseña = 'admin123';
            const hash = await bcrypt.hash(Contraseña, 10);
            db.query('INSERT INTO Usuarios (Nombre, Apellido, Email, NumeroCelular, Contraseña, Rol) VALUES (?, ?, ?, ?, ?, "admin")',
                [Nombre, Apellido, Email, NumeroCelular, hash],
                (e, result) => {
                    if (e) return res.status(500).json({ message: 'Error creando admin' });
                    return res.status(201).json({ 
                        message: 'Admin creado',
                        email: Email,
                        password_hint: 'admin123'
                    });
                });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error en bootstrap', error: err?.message });
    }
});

module.exports = router;

// Actualizar rol de usuario (solo admin)
router.put('/admin/usuarios/:id/rol', verificarToken, verificarAdmin, (req, res) => {
    const id = req.params.id;
    const { Rol } = req.body;
    if (!['usuario','admin'].includes(String(Rol))) {
        return res.status(400).json({ message: 'Rol inválido' });
    }
    db.query('UPDATE Usuarios SET Rol = ? WHERE Id = ?', [Rol, id], (err) => {
        if (err) return res.status(500).json({ message: 'Error actualizando rol' });
        return res.status(200).json({ message: 'Rol actualizado' });
    });
});

// Crear usuario (solo admin)
router.post('/admin/usuarios', verificarToken, verificarAdmin, async (req, res) => {
    const { Nombre, Apellido, Email, NumeroCelular, Contraseña, Rol = 'admin' } = req.body;
    if (!Nombre || !Apellido || !Email || !Contraseña) {
        return res.status(400).json({ message: 'Campos obligatorios: Nombre, Apellido, Email, Contraseña' });
    }
    if (!['usuario','admin'].includes(String(Rol))) {
        return res.status(400).json({ message: 'Rol inválido' });
    }
    try {
        db.query('SELECT Id FROM Usuarios WHERE Email = ?', [Email], async (err, rows) => {
            if (err) return res.status(500).json({ message: 'Error validando usuario' });
            if (rows && rows.length > 0) {
                return res.status(409).json({ message: 'Email ya registrado' });
            }
            const hash = await bcrypt.hash(Contraseña, 10);
            db.query('INSERT INTO Usuarios (Nombre, Apellido, Email, NumeroCelular, Contraseña, Rol) VALUES (?, ?, ?, ?, ?, ?)',
                [Nombre, Apellido, Email, String(NumeroCelular || '').replace(/\D/g,''), hash, Rol],
                (e, result) => {
                    if (e) return res.status(500).json({ message: 'Error al crear usuario' });
                    return res.status(201).json({ message: 'Usuario creado', usuarioId: result.insertId, Rol });
                });
        });
    } catch (err) {
        return res.status(500).json({ message: 'Error de servidor', error: err?.message });
    }
});
