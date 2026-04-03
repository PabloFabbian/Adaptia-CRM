import pool from '../config/db.js';

/** 1. KPIs del período — vista Owner (todos) o Profesional (solo suyo) */
export const getKPIs = async (req, res) => {
    const { clinicId, year, month } = req.query;
    const userId = req.user?.id;

    try {
        const memberRes = await pool.query(
            `SELECT m.id, m.role_id, r.name as role_name
             FROM members m JOIN roles r ON m.role_id = r.id
             WHERE m.user_id = $1 AND m.clinic_id = $2 LIMIT 1`,
            [userId, clinicId]
        );
        if (!memberRes.rows.length) return res.status(403).json({ error: 'Sin acceso' });

        const { id: memberId, role_name } = memberRes.rows[0];
        const isOwner = ['Tech Owner', 'Owner'].includes(role_name);

        const memberFilter = isOwner ? '' : `AND t.member_id = ${memberId}`;

        const { rows } = await pool.query(`
            SELECT
                COALESCE(SUM(amount_gross), 0)          AS gross_total,
                COALESCE(SUM(amount_clinic), 0)         AS clinic_total,
                COALESCE(SUM(amount_professional), 0)   AS professional_total,
                COALESCE(SUM(CASE WHEN status = 'pending' THEN amount_gross ELSE 0 END), 0) AS pending_total,
                COUNT(*)                                AS transaction_count
            FROM transactions t
            WHERE t.clinic_id = $1
              AND EXTRACT(YEAR  FROM t.transaction_date) = $2
              AND EXTRACT(MONTH FROM t.transaction_date) = $3
              ${memberFilter}
        `, [clinicId, year, month]);

        res.json({ success: true, data: rows[0], isOwner });
    } catch (error) {
        console.error('❌ Error en getKPIs:', error.message);
        res.status(500).json({ error: 'Error al obtener KPIs' });
    }
};

/** 2. Listar transacciones — Owner ve todas, Profesional solo las suyas */
export const getTransactions = async (req, res) => {
    const { clinicId, year, month, type } = req.query;
    const userId = req.user?.id;

    try {
        const memberRes = await pool.query(
            `SELECT m.id, m.role_id, r.name as role_name
             FROM members m JOIN roles r ON m.role_id = r.id
             WHERE m.user_id = $1 AND m.clinic_id = $2 LIMIT 1`,
            [userId, clinicId]
        );
        if (!memberRes.rows.length) return res.status(403).json({ error: 'Sin acceso' });

        const { id: memberId, role_name } = memberRes.rows[0];
        const isOwner = ['Tech Owner', 'Owner'].includes(role_name);

        let query = `
            SELECT
                t.*,
                m.name  AS professional_name,
                p.name  AS patient_name
            FROM transactions t
            LEFT JOIN members  m ON t.member_id  = m.id
            LEFT JOIN patients p ON t.patient_id = p.id
            WHERE t.clinic_id = $1
              AND EXTRACT(YEAR  FROM t.transaction_date) = $2
              AND EXTRACT(MONTH FROM t.transaction_date) = $3
        `;
        const params = [clinicId, year, month];

        if (!isOwner) {
            params.push(memberId);
            query += ` AND t.member_id = $${params.length}`;
        }
        if (type) {
            params.push(type);
            query += ` AND t.transaction_type = $${params.length}`;
        }

        query += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;

        const { rows } = await pool.query(query, params);
        res.json({ success: true, data: rows, isOwner });
    } catch (error) {
        console.error('❌ Error en getTransactions:', error.message);
        res.status(500).json({ error: 'Error al obtener transacciones' });
    }
};

/** 3. Registrar nueva transacción — aplica split automáticamente */
export const createTransaction = async (req, res) => {
    const {
        clinicId, patientId, appointmentId,
        transactionType, amountGross,
        paymentMethod, notes, transactionDate
    } = req.body;
    const userId = req.user?.id;

    try {
        // Obtener member_id del usuario logueado
        const memberRes = await pool.query(
            `SELECT id FROM members WHERE user_id = $1 AND clinic_id = $2 LIMIT 1`,
            [userId, clinicId]
        );
        if (!memberRes.rows.length) return res.status(403).json({ error: 'Sin acceso' });
        const memberId = memberRes.rows[0].id;

        // Obtener regla de split para este tipo
        const ruleRes = await pool.query(
            `SELECT professional_pct, clinic_pct
             FROM commission_rules
             WHERE clinic_id = $1 AND transaction_type = $2 LIMIT 1`,
            [clinicId, transactionType]
        );

        // Si no hay regla específica, usar defaults
        const defaults = { particular: [70, 30], os: [80, 20], pack: [60, 40] };
        const [proPct, clinicPct] = ruleRes.rows.length
            ? [ruleRes.rows[0].professional_pct, ruleRes.rows[0].clinic_pct]
            : defaults[transactionType] || [70, 30];

        const gross = parseFloat(amountGross);
        const amountPro = parseFloat((gross * proPct / 100).toFixed(2));
        const amountClinic = parseFloat((gross * clinicPct / 100).toFixed(2));

        const { rows } = await pool.query(`
            INSERT INTO transactions (
                clinic_id, member_id, patient_id, appointment_id,
                transaction_type, amount_gross,
                professional_pct, clinic_pct,
                amount_professional, amount_clinic,
                payment_method, notes, transaction_date, status
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending')
            RETURNING *
        `, [
            clinicId, memberId, patientId || null, appointmentId || null,
            transactionType, gross,
            proPct, clinicPct,
            amountPro, amountClinic,
            paymentMethod || 'efectivo', notes || null,
            transactionDate || new Date().toISOString().split('T')[0]
        ]);

        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('❌ Error en createTransaction:', error.message);
        res.status(500).json({ error: 'Error al registrar transacción' });
    }
};

/** 4. Marcar transacción como pagada */
export const markTransactionPaid = async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query(
            `UPDATE transactions SET status = 'paid' WHERE id = $1 RETURNING *`,
            [parseInt(id, 10)]
        );
        if (!rows.length) return res.status(404).json({ error: 'Transacción no encontrada' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('❌ Error en markTransactionPaid:', error.message);
        res.status(500).json({ error: 'Error al actualizar transacción' });
    }
};

/** 5. Obtener o generar liquidación del período */
export const getOrCreateSettlement = async (req, res) => {
    const { clinicId, memberId, year, month } = req.query;

    try {
        // Intentar obtener liquidación existente
        let { rows } = await pool.query(
            `SELECT s.*, m.name as member_name
             FROM settlements s
             JOIN members m ON s.member_id = m.id
             WHERE s.clinic_id = $1 AND s.member_id = $2
               AND s.period_year = $3 AND s.period_month = $4`,
            [clinicId, memberId, year, month]
        );

        if (!rows.length) {
            // Calcular totales desde transacciones
            const totals = await pool.query(`
                SELECT
                    COALESCE(SUM(amount_gross), 0)        AS gross_total,
                    COALESCE(SUM(amount_clinic), 0)       AS clinic_fee,
                    COALESCE(SUM(amount_professional), 0) AS net_honorario
                FROM transactions
                WHERE clinic_id = $1 AND member_id = $2
                  AND EXTRACT(YEAR  FROM transaction_date) = $3
                  AND EXTRACT(MONTH FROM transaction_date) = $4
                  AND status != 'cancelled'
            `, [clinicId, memberId, year, month]);

            const { gross_total, clinic_fee, net_honorario } = totals.rows[0];

            // Crear la liquidación
            const created = await pool.query(`
                INSERT INTO settlements
                    (clinic_id, member_id, period_year, period_month,
                     gross_total, clinic_fee, net_honorario, status)
                VALUES ($1,$2,$3,$4,$5,$6,$7,'pending_signatures')
                ON CONFLICT (clinic_id, member_id, period_year, period_month)
                DO UPDATE SET
                    gross_total   = EXCLUDED.gross_total,
                    clinic_fee    = EXCLUDED.clinic_fee,
                    net_honorario = EXCLUDED.net_honorario
                RETURNING *
            `, [clinicId, memberId, year, month, gross_total, clinic_fee, net_honorario]);

            rows = created.rows;
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('❌ Error en getOrCreateSettlement:', error.message);
        res.status(500).json({ error: 'Error al obtener liquidación' });
    }
};

/** 6. Aprobar liquidación (firma doble) */
export const approveSettlement = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body; // 'member' | 'owner'
    const userId = req.user?.id;

    try {
        const settlement = await pool.query(
            `SELECT * FROM settlements WHERE id = $1`, [id]
        );
        if (!settlement.rows.length) return res.status(404).json({ error: 'Liquidación no encontrada' });

        const field = role === 'member'
            ? 'approved_by_member_at'
            : 'approved_by_owner_at';

        const { rows } = await pool.query(
            `UPDATE settlements SET ${field} = NOW()
             WHERE id = $1 RETURNING *`,
            [parseInt(id, 10)]
        );

        const s = rows[0];

        // Si ambas firmas están, cerrar la liquidación
        if (s.approved_by_member_at && s.approved_by_owner_at) {
            await pool.query(
                `UPDATE settlements SET status = 'closed', closed_at = NOW() WHERE id = $1`,
                [parseInt(id, 10)]
            );
            s.status = 'closed';
        }

        res.json({ success: true, data: s });
    } catch (error) {
        console.error('❌ Error en approveSettlement:', error.message);
        res.status(500).json({ error: 'Error al aprobar liquidación' });
    }
};

/** 7. Listar liquidaciones del período — Owner ve todas, Profesional solo las suyas */
export const getSettlements = async (req, res) => {
    const { clinicId, year, month } = req.query;
    const userId = req.user?.id;

    try {
        const memberRes = await pool.query(
            `SELECT m.id, r.name as role_name
             FROM members m JOIN roles r ON m.role_id = r.id
             WHERE m.user_id = $1 AND m.clinic_id = $2 LIMIT 1`,
            [userId, clinicId]
        );
        if (!memberRes.rows.length) return res.status(403).json({ error: 'Sin acceso' });

        const { id: memberId, role_name } = memberRes.rows[0];
        const isOwner = ['Tech Owner', 'Owner'].includes(role_name);

        let query = `
            SELECT s.*, m.name as member_name
            FROM settlements s
            JOIN members m ON s.member_id = m.id
            WHERE s.clinic_id = $1
              AND s.period_year  = $2
              AND s.period_month = $3
        `;
        const params = [clinicId, year, month];

        if (!isOwner) {
            params.push(memberId);
            query += ` AND s.member_id = $${params.length}`;
        }

        query += ` ORDER BY s.created_at DESC`;

        const { rows } = await pool.query(query, params);
        res.json({ success: true, data: rows, isOwner });
    } catch (error) {
        console.error('❌ Error en getSettlements:', error.message);
        res.status(500).json({ error: 'Error al obtener liquidaciones' });
    }
};

/** 8. Obtener reglas de split */
export const getCommissionRules = async (req, res) => {
    const { clinicId } = req.query;
    try {
        const { rows } = await pool.query(
            `SELECT * FROM commission_rules WHERE clinic_id = $1 ORDER BY transaction_type`,
            [clinicId]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('❌ Error en getCommissionRules:', error.message);
        res.status(500).json({ error: 'Error al obtener reglas' });
    }
};

/** 9. Actualizar regla de split */
export const updateCommissionRule = async (req, res) => {
    const { id } = req.params;
    const { professionalPct, clinicPct } = req.body;

    if (parseFloat(professionalPct) + parseFloat(clinicPct) !== 100) {
        return res.status(400).json({ error: 'Los porcentajes deben sumar 100' });
    }

    try {
        const { rows } = await pool.query(
            `UPDATE commission_rules
             SET professional_pct = $1, clinic_pct = $2
             WHERE id = $3 RETURNING *`,
            [professionalPct, clinicPct, parseInt(id, 10)]
        );
        if (!rows.length) return res.status(404).json({ error: 'Regla no encontrada' });
        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('❌ Error en updateCommissionRule:', error.message);
        res.status(500).json({ error: 'Error al actualizar regla' });
    }
};

/** 10. Preview del split antes de guardar */
export const previewSplit = async (req, res) => {
    const { clinicId, transactionType, amountGross } = req.query;

    try {
        const ruleRes = await pool.query(
            `SELECT professional_pct, clinic_pct FROM commission_rules
             WHERE clinic_id = $1 AND transaction_type = $2 LIMIT 1`,
            [clinicId, transactionType]
        );

        const defaults = { particular: [70, 30], os: [80, 20], pack: [60, 40] };
        const [proPct, clinicPct] = ruleRes.rows.length
            ? [ruleRes.rows[0].professional_pct, ruleRes.rows[0].clinic_pct]
            : defaults[transactionType] || [70, 30];

        const gross = parseFloat(amountGross);
        const amountPro = parseFloat((gross * proPct / 100).toFixed(2));
        const amountCli = parseFloat((gross * clinicPct / 100).toFixed(2));

        res.json({
            success: true,
            data: {
                gross, proPct, clinicPct,
                amountProfessional: amountPro,
                amountClinic: amountCli,
            }
        });
    } catch (error) {
        console.error('❌ Error en previewSplit:', error.message);
        res.status(500).json({ error: 'Error al calcular preview' });
    }
};