import pool from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
  static async registerUser(name: string, email: string, password: string) {
    try {

      const userExists = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (userExists.rows.length > 0) {
        throw new Error('Email já registrado!');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
        [name, email, hashedPassword]
      );

      const user = result.rows[0];

      const companyName = `${name}'s Company`;
      await pool.query(
        'INSERT INTO companies (user_id, name) VALUES ($1, $2)',
        [user.id, companyName]
      );

      const token = jwt.sign(
        { id: user.id, email: user.email },
        (process.env.JWT_SECRET || 'secret') as string,
        {
          expiresIn: process.env.JWT_EXPIRY || '7d',
        } as any
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  static async loginUser(email: string, password: string) {
    try {
      const result = await pool.query(
        'SELECT id, email, name, password_hash FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('E-mail ou senha inválidos');
      }

      const user = result.rows[0];

      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        throw new Error('E-mail ou senha inválidos');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        (process.env.JWT_SECRET || 'secret') as string,
        {
          expiresIn: process.env.JWT_EXPIRY || '7d',
        } as any
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }
}
