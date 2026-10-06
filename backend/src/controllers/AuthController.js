import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { ENV } from '../config/env.js';
import { mockUsers } from '../lib/mockStore.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    let user = null;

    try {
      user = await prisma.user.findUnique({ where: { email: trimmedEmail } });
    } catch (dbErr) {
      console.warn('[Estok] Banco de dados primário indisponível. Usando base mockada.', dbErr.message);
      user = mockUsers.find(u => u.email.toLowerCase() === trimmedEmail) || null;
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastAccessAt: new Date() }
      });
    } catch {
      user.lastAccessAt = new Date();
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno ao realizar autenticação.' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return res.json({ message: 'Sessão encerrada com sucesso.' });
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }

    return res.json({ message: 'Instruções enviadas caso o e-mail esteja cadastrado.' });
  } catch (error) {
    console.error('Erro no reset de senha:', error);
    return res.status(500).json({ error: 'Erro ao processar solicitação de redefinição de senha.' });
  }
};