import { Client } from 'pg';
import { FixAttempt } from './schemas.js';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

const client = new Client({ connectionString: DATABASE_URL });

export async function connectDb() {
  await client.connect();
}

export async function ensureSchema() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS attempts (
      id SERIAL PRIMARY KEY,
      task_id TEXT NOT NULL,
      attempt_number INTEGER NOT NULL,
      code_version TEXT NOT NULL,
      test_result TEXT NOT NULL,
      diagnosis TEXT,
      succeeded BOOLEAN NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
}

export async function saveAttempt(attempt: FixAttempt) {
  await client.query(
    `INSERT INTO attempts (task_id, attempt_number, code_version, test_result, diagnosis, succeeded, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [attempt.taskId, attempt.attemptNumber, attempt.codeVersion, attempt.testResult, attempt.diagnosis ?? null, attempt.succeeded, attempt.createdAt]
  );
}

export async function closeDb() {
  await client.end();
}
