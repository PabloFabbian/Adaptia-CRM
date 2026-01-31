import pkg from 'pg';
const { Pool } = pkg;
import { createDatabaseSchema } from './src/auth/models.js';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: No se encontró DATABASE_URL en el archivo .env");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const seed = async () => {
    try {
        console.log("🚀 Iniciando Sincronización Global de Adaptia...");

        // 1. Asegurar esquema
        await pool.query(createDatabaseSchema);

        // 2. Roles
        const roles = ['Owner', 'Administrador', 'Especialista', 'Secretaría', 'tech'];
        for (const roleName of roles) {
            await pool.query("INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING", [roleName]);
        }

        // 3. Capacidades
        const caps = ['view_all_appointments', 'view_all_patients', 'view_all_clinical_notes', 'manage_clinic'];
        for (const cap of caps) {
            await pool.query("INSERT INTO capabilities (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING", [cap]);
        }

        // 4. Gestión de Clínica
        const clinicCheck = await pool.query("SELECT id FROM clinics WHERE name = 'Melon Clinic España' LIMIT 1");
        let clinicId = clinicCheck.rows.length > 0
            ? clinicCheck.rows[0].id
            : (await pool.query("INSERT INTO clinics (name) VALUES ('Melon Clinic España') RETURNING id")).rows[0].id;

        // --- 5. GESTIÓN DE USUARIOS (Pablo y Luis) ---
        const usersToCreate = [
            { name: 'Pablo Fabbian', email: 'pablo.fabbian@adaptia.com', pass: 'Admin159', role: 'Owner' },
            { name: 'Luis David', email: 'luis@adaptia.com', pass: '123', role: 'Administrador' }
        ];

        for (const userData of usersToCreate) {
            // Actualizar o insertar usuario
            await pool.query(`
                INSERT INTO users (name, email, password_hash) 
                VALUES ($1, $2, $3) 
                ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`,
                [userData.name, userData.email, userData.pass]
            );

            const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1 LIMIT 1", [userData.role]);
            const roleId = roleRes.rows[0].id;

            // Lógica Quirúrgica para Members: Evita el error de Duplicado de PKEY
            const memberCheck = await pool.query("SELECT id FROM members WHERE name = $1 LIMIT 1", [userData.name]);

            if (memberCheck.rows.length > 0) {
                console.log(`🔄 Actualizando permisos para: ${userData.name}`);
                await pool.query(
                    "UPDATE members SET role_id = $1, clinic_id = $2 WHERE name = $3",
                    [roleId, clinicId, userData.name]
                );
            } else {
                console.log(`🆕 Creando registro de miembro para: ${userData.name}`);
                await pool.query(
                    "INSERT INTO members (name, role_id, clinic_id) VALUES ($1, $2, $3)",
                    [userData.name, roleId, clinicId]
                );
            }
        }

        // 6. Resetear secuencias de IDs para evitar futuros errores de duplicados
        await pool.query(`
            SELECT setval(pg_get_serial_sequence('members', 'id'), coalesce(max(id), 1)) FROM members;
            SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;
        `).catch(e => console.log("ℹ️ Secuencias actualizadas."));

        console.log(`
        ✅ SEED COMPLETADO CON ÉXITO
        --------------------------------------------------
        PLATFORM ADMIN (OWNER):
        User: pablo.fabbian@adaptia.com
        Pass: Admin159

        ADMINISTRADOR:
        User: luis@adaptia.com
        Pass: 123
        --------------------------------------------------
        `);

    } catch (err) {
        console.error("❌ Error crítico en el seed:", err.message);
    } finally {
        await pool.end();
    }
};

seed();