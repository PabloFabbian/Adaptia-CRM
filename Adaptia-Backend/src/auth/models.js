export const createDatabaseSchema = `
  CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS capabilities (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS role_capabilities (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    capability_id INTEGER REFERENCES capabilities(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, capability_id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_member_id INTEGER REFERENCES members(id),
    clinic_id INTEGER REFERENCES clinics(id),
    history JSONB DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL,
    is_granted BOOLEAN DEFAULT FALSE,
    UNIQUE(member_id, resource_type, clinic_id)
  );
  
  CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    owner_member_id INTEGER REFERENCES members(id),
    clinic_id INTEGER REFERENCES clinics(id),
    date DATE NOT NULL,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS clinical_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id),
    title TEXT,
    summary TEXT,
    category TEXT DEFAULT 'Evolución',
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;