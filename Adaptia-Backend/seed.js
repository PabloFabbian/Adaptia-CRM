import pg from 'pg';
const { Pool } = pg;
import { createDatabaseSchema } from './src/auth/models.js';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: No se encontró DATABASE_URL");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
});

const seed = async () => {
    try {
        console.log("🚀 Iniciando Sincronización Global de Adaptia...");

        // 1. Asegurar esquema
        await pool.query(createDatabaseSchema);
        console.log("✅ Schema sincronizado.");

        // 2. Roles
        const roles = [
            { name: 'Tech Owner', desc: 'Control total del sistema' },
            { name: 'Owner', desc: 'Acceso administrativo total a la clínica' },
            { name: 'Psicólogo', desc: 'Acceso clínico y gestión de pacientes' },
            { name: 'Secretaría', desc: 'Gestión de agenda y pacientes' }
        ];

        for (const r of roles) {
            await pool.query(
                `INSERT INTO roles (name, description) VALUES ($1, $2)
                 ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description`,
                [r.name, r.desc]
            );
        }
        console.log("✅ Roles sincronizados.");

        // 3. Capacidades
        const capabilities = [
            { slug: 'clinic.appointments.read', name: 'Ver citas médicas' },
            { slug: 'clinic.appointments.write', name: 'Crear y editar citas' },
            { slug: 'clinic.patients.read', name: 'Ver lista de pacientes' },
            { slug: 'clinic.patients.write', name: 'Registrar o editar pacientes' },
            { slug: 'clinic.records.read', name: 'Ver expedientes clínicos' },
            { slug: 'clinic.records.write', name: 'Editar expedientes clínicos' },
            { slug: 'clinic.records.read.all', name: 'Ver todos los expedientes (toda la clínica)' },
            { slug: 'clinic.notes.read', name: 'Leer notas de evolución' },
            { slug: 'clinic.notes.write', name: 'Crear notas clínicas' },
            { slug: 'clinic.members.read', name: 'Ver personal de la clínica' },
            { slug: 'clinic.roles.read', name: 'Ver roles y permisos' },
            { slug: 'clinic.settings.write', name: 'Configurar datos de la clínica' },
            { slug: 'clinic.categories.read', name: 'Ver categorías de servicios' },
            { slug: 'clinic.categories.write', name: 'Crear y editar categorías' },
            { slug: 'clinic.services.read', name: 'Ver servicios' },
            { slug: 'clinic.services.write', name: 'Crear y editar servicios' },
            { slug: 'manage_clinic', name: 'Gestión total de clínica' }
        ];

        for (const cap of capabilities) {
            await pool.query(
                `INSERT INTO capabilities (slug, name)
                 VALUES ($1, $2)
                 ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name`,
                [cap.slug, cap.name]
            );
        }
        console.log("✅ Capacidades sincronizadas.");

        // 4. Clínica base
        const clinicRes = await pool.query(
            `INSERT INTO clinics (name) VALUES ('Melon Clinic España')
             ON CONFLICT DO NOTHING RETURNING id`
        );
        const clinicId = clinicRes.rows.length > 0
            ? clinicRes.rows[0].id
            : (await pool.query("SELECT id FROM clinics LIMIT 1")).rows[0].id;
        console.log(`✅ Clínica activa — ID: ${clinicId}`);

        // 5. Asignar todas las capacidades a roles administrativos
        const allCaps = await pool.query("SELECT id FROM capabilities");
        const adminRoles = await pool.query("SELECT id FROM roles WHERE name IN ('Owner', 'Tech Owner')");

        for (const role of adminRoles.rows) {
            for (const cap of allCaps.rows) {
                await pool.query(
                    `INSERT INTO role_capabilities (role_id, capability_id)
                     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                    [role.id, cap.id]
                );
            }
        }
        console.log("✅ Permisos administrativos asignados.");

        // 6. Usuarios y Members
        const usersToCreate = [
            { name: 'Pablo Fabbian', email: 'pablo.fabbian@adaptia.com', pass: 'Admin159', role: 'Tech Owner' },
            { name: 'Luis David', email: 'luis@adaptia.com', pass: '123', role: 'Psicólogo' }
        ];

        for (const userData of usersToCreate) {
            const userRes = await pool.query(
                `INSERT INTO users (name, email, password_hash)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id`,
                [userData.name, userData.email, userData.pass]
            );
            const userId = userRes.rows[0].id;

            const roleRes = await pool.query("SELECT id FROM roles WHERE name = $1", [userData.role]);
            const roleId = roleRes.rows[0].id;

            await pool.query(
                `INSERT INTO members (name, role_id, clinic_id, user_id)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id) DO UPDATE SET role_id = EXCLUDED.role_id, name = EXCLUDED.name`,
                [userData.name, roleId, clinicId, userId]
            );
        }
        console.log("✅ Usuarios y miembros sincronizados.");

        // 7. Categorías de ejemplo
        const sampleCategories = [
            { name: 'Psicología', description: 'Terapia individual, grupal y evaluaciones cognitivas.', color: '#a855f7' },
            { name: 'Nutrición', description: 'Planes de alimentación y seguimiento metabólico.', color: '#50e3c2' },
            { name: 'Medicina General', description: 'Consultas de atención primaria y chequeos anuales.', color: '#3b82f6' },
            { name: 'Fisioterapia', description: 'Rehabilitación física y masajes terapéuticos.', color: '#f97316' },
        ];

        for (const cat of sampleCategories) {
            const slug = cat.name.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            await pool.query(
                `INSERT INTO categories (clinic_id, name, description, slug, color)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT (clinic_id, slug) DO UPDATE
                 SET name = EXCLUDED.name, description = EXCLUDED.description, color = EXCLUDED.color`,
                [clinicId, cat.name, cat.description, slug, cat.color]
            );
        }
        console.log("✅ Categorías de ejemplo sincronizadas.");

        // 8. Servicios de ejemplo
        const categoryRows = await pool.query(
            "SELECT id, slug FROM categories WHERE clinic_id = $1", [clinicId]
        );
        const catBySlug = Object.fromEntries(categoryRows.rows.map(r => [r.slug, r.id]));

        const sampleServices = [
            { slug: 'psicologia', name: 'Consulta Individual', description: 'Sesión de psicoterapia de 50 minutos.', duration: 50, price: 80.00 },
            { slug: 'psicologia', name: 'Terapia de Pareja', description: 'Sesión conjunta para resolución de conflictos.', duration: 60, price: 100.00 },
            { slug: 'nutricion', name: 'Plan Nutricional Inicial', description: 'Evaluación y diseño de plan alimentario.', duration: 60, price: 70.00 },
            { slug: 'nutricion', name: 'Seguimiento Mensual', description: 'Control de evolución y ajuste de dieta.', duration: 30, price: 40.00 },
            { slug: 'medicina-general', name: 'Consulta General', description: 'Atención primaria y diagnóstico.', duration: 30, price: 50.00 },
            { slug: 'medicina-general', name: 'Chequeo Anual Completo', description: 'Revisión integral con análisis de laboratorio.', duration: 90, price: 150.00 },
            { slug: 'fisioterapia', name: 'Sesión de Rehabilitación', description: 'Tratamiento físico personalizado.', duration: 45, price: 60.00 },
            { slug: 'fisioterapia', name: 'Masaje Terapéutico', description: 'Alivio de contracturas y dolor muscular.', duration: 60, price: 55.00 },
        ];

        for (const svc of sampleServices) {
            const categoryId = catBySlug[svc.slug];
            if (!categoryId) continue;

            await pool.query(
                `INSERT INTO services (clinic_id, category_id, name, description, duration_min, price)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT DO NOTHING`,
                [clinicId, categoryId, svc.name, svc.description, svc.duration, svc.price]
            );
        }
        console.log("✅ Servicios de ejemplo sincronizados.");

        console.log("\n🎉 SEED COMPLETADO — Adaptia CRM listo.\n");

    } catch (err) {
        console.error("❌ Error en el seed:", err);
    } finally {
        await pool.end();
    }
};

seed();