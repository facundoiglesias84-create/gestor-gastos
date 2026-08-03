import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://xata:TLUgqZPivk0btPEM8gTFtx2msl4W53jHadpKZMh5PLDvVz0tTFEM9mfISIU1UusB@h42kjm90qp7v98e0eck13kqk0s.us-east-1.xata.tech/postgres?sslmode=require';

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDb() {
  const client = await pool.connect();
  try {
    console.log('⚡ Conectando a PostgreSQL Xata...');
    
    // Tabla Usuarios
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        monthly_income NUMERIC(12, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tabla de Ingresos/Sueldos por Mes
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_incomes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_year_month UNIQUE(user_id, year, month)
      );
    `);

    // Tabla Gastos
    await client.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        payment_method VARCHAR(100) DEFAULT 'Efectivo',
        card_name VARCHAR(100) DEFAULT '',
        date DATE NOT NULL,
        impact_date DATE NULL,
        pay_next_month BOOLEAN DEFAULT false,
        is_paid BOOLEAN DEFAULT true,
        is_recurring BOOLEAN DEFAULT false,
        installment_current INTEGER DEFAULT 1,
        installment_total INTEGER DEFAULT 1,
        parent_expense_id INTEGER NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Columnas adicionales si no existen
    await client.query(`
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS card_name VARCHAR(100) DEFAULT '';
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS impact_date DATE NULL;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS pay_next_month BOOLEAN DEFAULT false;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS installment_current INTEGER DEFAULT 1;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS installment_total INTEGER DEFAULT 1;
      ALTER TABLE expenses ADD COLUMN IF NOT EXISTS parent_expense_id INTEGER NULL;
    `);

    console.log('✅ Tablas y columnas de Xata PostgreSQL verificadas.');
  } catch (error) {
    console.error('❌ Error al inicializar las tablas en Xata:', error);
  } finally {
    client.release();
  }
}
