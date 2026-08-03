import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';
import { pool, initDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

app.use(cors());
app.use(express.json());

// Middleware para verificar JWT
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// --- RUTAS DE AUTENTICACIÓN ---

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, monthly_income) VALUES ($1, $2, $3, $4) RETURNING id, name, email, monthly_income',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, 0]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userData } = user;

    res.json({ token, user: userData });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, monthly_income FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- RUTAS DE SUELDO POR MES Y AÑO ---

app.get('/api/user/income', authenticate, async (req, res) => {
  const { year, month } = req.query;
  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || (new Date().getMonth() + 1);

  try {
    const exact = await pool.query(
      'SELECT amount FROM user_incomes WHERE user_id = $1 AND year = $2 AND month = $3',
      [req.user.id, targetYear, targetMonth]
    );

    if (exact.rows.length > 0) {
      return res.json({ monthly_income: parseFloat(exact.rows[0].amount) });
    }

    const previous = await pool.query(
      `SELECT amount FROM user_incomes
       WHERE user_id = $1 AND (year < $2 OR (year = $2 AND month <= $3))
       ORDER BY year DESC, month DESC LIMIT 1`,
      [req.user.id, targetYear, targetMonth]
    );

    if (previous.rows.length > 0) {
      return res.json({ monthly_income: parseFloat(previous.rows[0].amount) });
    }

    const userResult = await pool.query('SELECT monthly_income FROM users WHERE id = $1', [req.user.id]);
    res.json({ monthly_income: parseFloat(userResult.rows[0]?.monthly_income || 0) });
  } catch (error) {
    console.error('Error al obtener sueldo del mes:', error);
    res.status(500).json({ error: 'Error al consultar sueldo' });
  }
});

app.put('/api/user/income', authenticate, async (req, res) => {
  const { year, month, monthly_income } = req.body;
  const incomeVal = parseFloat(monthly_income) || 0;
  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || (new Date().getMonth() + 1);

  try {
    await pool.query(
      `INSERT INTO user_incomes (user_id, year, month, amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, year, month)
       DO UPDATE SET amount = EXCLUDED.amount`,
      [req.user.id, targetYear, targetMonth, incomeVal]
    );

    await pool.query('UPDATE users SET monthly_income = $1 WHERE id = $2', [incomeVal, req.user.id]);

    res.json({ success: true, year: targetYear, month: targetMonth, monthly_income: incomeVal });
  } catch (error) {
    console.error('Error al actualizar ingreso:', error);
    res.status(500).json({ error: 'Error al actualizar el ingreso' });
  }
});

// --- RUTAS DE GASTOS ---

// Helper para calcular la fecha exacta de cada cuota (Cuota 1 = Mes Siguiente, Cuota 2 = Mes Subsiguiente, etc.)
function getInstallmentDate(purchaseDateStr, installmentIndex) {
  const parts = purchaseDateStr.split('-');
  const baseYear = parseInt(parts[0], 10);
  const baseMonth = parseInt(parts[1], 10); // 1-12
  const baseDay = Math.min(parseInt(parts[2], 10) || 1, 28);

  let targetMonth = baseMonth + installmentIndex; // i = 1 es mes siguiente (baseMonth + 1)
  let targetYear = baseYear;

  while (targetMonth > 12) {
    targetMonth -= 12;
    targetYear += 1;
  }

  const mm = String(targetMonth).padStart(2, '0');
  const dd = String(baseDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
}

app.get('/api/expenses', authenticate, async (req, res) => {
  const { year, month } = req.query;
  const targetYear = parseInt(year);
  const targetMonth = parseInt(month);

  try {
    let query = 'SELECT * FROM expenses WHERE user_id = $1';
    const params = [req.user.id];

    if (targetYear && targetMonth) {
      const monthFormatted = String(targetMonth).padStart(2, '0');
      const targetDateStr = `${targetYear}-${monthFormatted}-28`;

      query += ` AND (
        (EXTRACT(YEAR FROM COALESCE(impact_date, date)) = $2 AND EXTRACT(MONTH FROM COALESCE(impact_date, date)) = $3)
        OR (is_recurring = true AND date <= $4::date)
      )`;
      params.push(targetYear, targetMonth, targetDateStr);
    }

    query += ' ORDER BY COALESCE(impact_date, date) DESC, id DESC';

    const result = await pool.query(query, params);

    const uniqueExpenses = [];
    const seenRecurringTitles = new Set();

    result.rows.forEach(item => {
      if (item.is_recurring) {
        if (seenRecurringTitles.has(item.title.toLowerCase())) {
          return;
        }
        seenRecurringTitles.add(item.title.toLowerCase());
      }
      uniqueExpenses.push(item);
    });

    res.json({ expenses: uniqueExpenses });
  } catch (error) {
    console.error('Error al obtener gastos:', error);
    res.status(500).json({ error: 'Error al obtener los gastos' });
  }
});

app.post('/api/expenses', authenticate, async (req, res) => {
  const { title, amount, category, payment_method, card_name, date, pay_next_month, is_paid, is_recurring, installment_total } = req.body;

  if (!title || !amount || !category || !date) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const totalCuotas = parseInt(installment_total) || 1;
  const isRec = Boolean(is_recurring);

  try {
    if (totalCuotas > 1) {
      // Generar EXACTAMENTE 1 cuota por cada mes consecutivo arrancando el MES SIGUIENTE
      const createdExpenses = [];
      let parentId = null;

      for (let i = 1; i <= totalCuotas; i++) {
        // Cuota i impacta en el mes = mes_compra + i
        const impactDateStr = getInstallmentDate(date, i);

        const result = await pool.query(
          `INSERT INTO expenses (user_id, title, amount, category, payment_method, card_name, date, impact_date, pay_next_month, is_paid, is_recurring, installment_current, installment_total, parent_expense_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           RETURNING *`,
          [
            req.user.id,
            title.trim(),
            parseFloat(amount),
            category,
            payment_method || 'Tarjeta de Crédito',
            card_name || 'Visa',
            date, // Fecha de compra original
            impactDateStr, // Fecha de la cuota en su respectivo mes
            true, // Siempre a mes vencido
            false,
            false,
            i,
            totalCuotas,
            parentId
          ]
        );

        const newExpense = result.rows[0];
        if (i === 1) parentId = newExpense.id;
        createdExpenses.push(newExpense);
      }

      return res.status(201).json({ expense: createdExpenses[0], total_created: createdExpenses.length });
    } else {
      // Gasto normal o Fijo
      const isPayNextMonth = pay_next_month !== undefined ? Boolean(pay_next_month) : payment_method.toLowerCase().includes('tarjeta');
      const impactDateStr = isPayNextMonth ? getInstallmentDate(date, 1) : date;

      const result = await pool.query(
        `INSERT INTO expenses (user_id, title, amount, category, payment_method, card_name, date, impact_date, pay_next_month, is_paid, is_recurring, installment_current, installment_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          req.user.id,
          title.trim(),
          parseFloat(amount),
          category,
          payment_method || 'Efectivo',
          card_name || '',
          date,
          impactDateStr,
          isPayNextMonth,
          true,
          isRec,
          1,
          1
        ]
      );
      return res.status(201).json({ expense: result.rows[0] });
    }
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    res.status(500).json({ error: 'Error al crear el gasto' });
  }
});

app.put('/api/expenses/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, payment_method, card_name, date, pay_next_month, is_recurring } = req.body;

  const isPayNextMonth = pay_next_month !== undefined ? Boolean(pay_next_month) : payment_method.toLowerCase().includes('tarjeta');
  const impactDateStr = isPayNextMonth ? getInstallmentDate(date, 1) : date;

  try {
    const result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, category = $3, payment_method = $4, card_name = $5, date = $6, impact_date = $7, pay_next_month = $8, is_recurring = $9
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [title, parseFloat(amount), category, payment_method, card_name || '', date, impactDateStr, isPayNextMonth, Boolean(is_recurring), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    res.json({ expense: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar gasto:', error);
    res.status(500).json({ error: 'Error al actualizar el gasto' });
  }
});

app.delete('/api/expenses/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json({ message: 'Gasto eliminado con éxito', id });
  } catch (error) {
    console.error('Error al eliminar gasto:', error);
    res.status(500).json({ error: 'Error al eliminar el gasto' });
  }
});

// --- INICIALIZACIÓN DE SERVIDOR Y VITE ---

async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

startServer();
