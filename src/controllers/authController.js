// controllers/authController.js
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';
import { generateToken, verifyToken } from '../config/auth.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'customer' // Nuevos usuarios son clientes por defecto
      },
    });

    const token = generateToken(user);
    res.status(201).json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

export const updateProfile = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { email },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Generar nuevo token si el email cambió
    const token = generateToken(user);
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};
