const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');
const { sendPassword } = require('../config/email');
require('dotenv').config();

router.post('/olvide-contrasena', async (req, res) => {
    const { Email} = req.body;

    if (!Email) {
        return res.status(400).send("El Email es obligatorio");
    }

    try {
        db.query('SELECT * FROM Usuarios WHERE Email = ?', [Email], async (err, results) => {
            if (err) {
                console.error('Error en la consulta:', err);
                return res.status(500).send('Error interno');
            }

            // Aunque no se encuentre el usuario, se responde igual por seguridad
            if (results.length === 0) {
                return res.status(200).send("Si el Email existe recibirás una URL");
            }

            const usuario = results[0];
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 hora

            db.query(
                'UPDATE Usuarios SET reset_token = ?, reset_token_expiry = ? WHERE idUsuarios = ?',
                [resetToken, resetTokenExpiry, usuario.id],
                async (updateErr) => {
                    if (updateErr) {
                        console.error('Error al actualizar el usuario:', updateErr);
                        return res.status(500).send('Error interno al guardar el token');
                    }

                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5500';
                    const resetUrl = `${frontendUrl}/reset.html?token=${resetToken}`;

                    try {
                        await sendPassword(Email, resetUrl);
                        res.status(200).send('Si el Email existe recibirás un link');
                    } catch (mailError) {
                        console.error('Error al enviar el Email:', mailError);
                        return res.status(500).send('Error al enviar el Email de restablecimiento');
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error en olvide contraseña:', error);
        res.status(500).send('Error interno');
    }
});

// Verificar token y restablecer contraseña
router.post('/reset-password', async (req, res) => {
  const { token, nueva_contraseña } = req.body;
  
  if (!token || !nueva_contraseña) {
    return res.status(400).send('Faltan datos obligatorios');
  }
  
  // Validar longitud mínima de contraseña
  if (nueva_contraseña.length < 6) {
    return res.status(400).send('La contraseña debe tener al menos 6 caracteres');
  }
  
  try {
    // Buscar usuario con ese token y que no haya expirado
    db.query(
      'SELECT * FROM Usuarios WHERE reset_token = ? AND reset_token_expiry > ?',
      [token, Date.now()],
      async (err, results) => {
        if (err) {
          console.error('Error en la consulta:', err);
          return res.status(500).send('Error interno');
        }
        
        if (results.length === 0) {
          return res.status(400).send('Token inválido o expirado');
        }
        
        const usuario = results[0];
        
        // Encriptar nueva contraseña
        const hash = await bcrypt.hash(nueva_contraseña, 10);
        
        // Actualizar contraseña y eliminar token
        db.query(
          'UPDATE Usuarios SET contraseña = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
          [hash, usuario.id],
          (updateErr) => {
            if (updateErr) {
              console.error('Error al actualizar contraseña:', updateErr);
              return res.status(500).send('Error interno');
            }
            
            res.status(200).send('Contraseña actualizada correctamente');
          }
        );
      }
    );
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).send('Error interno');
  }
});

module.exports = router;
  
            
        
