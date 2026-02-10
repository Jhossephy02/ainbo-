const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
};

module.exports = { verificarToken };
