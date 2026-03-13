export const createDatabaseSchema = `
  CREATE TABLE IF NOT EXISTS clinics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    resource TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, role_name, resource)
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
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    UNIQUE(user_id)
  );

  CREATE TABLE IF NOT EXISTS invitations (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    invited_by INTEGER REFERENCES users(id),
    token TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_member_id INTEGER REFERENCES members(id),
    clinic_id INTEGER REFERENCES clinics(id),
    history JSONB DEFAULT '{}',
    email TEXT,
    phone TEXT,
    dni VARCHAR,
    address TEXT,
    birth_date DATE,
    gender VARCHAR,
    insurance_name VARCHAR,
    insurance_number VARCHAR
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

  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL,
    color TEXT DEFAULT '#50e3c2',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(clinic_id, slug)
  );

  CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    duration_min INTEGER DEFAULT 60,
    price NUMERIC(10,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_categories_clinic ON categories(clinic_id);
  CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
  CREATE INDEX IF NOT EXISTS idx_services_clinic    ON services(clinic_id);
`;