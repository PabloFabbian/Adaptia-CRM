# Adaptia 🧠 - Gestión Clínica Colaborativa

**Adaptia** es una plataforma de gestión para clínicas psicológicas diseñada bajo un paradigma de colaboración horizontal. A diferencia de los sistemas rígidos, Adaptia permite que los profesionales crezcan juntos manteniendo su autonomía y privacidad.

## 🚀 El Corazón de Adaptia: Permisos Flexibles

El sistema no se basa en una jerarquía fija, sino en un **doble chequeo de seguridad**:

1.  **Capabilities (Capacidades):** Definidas por el Rol del miembro (ej: "Secretaria", "Socio", "Administrador"). Determinan qué acciones *técnicas* puede realizar el usuario.
2.  **Scopes (Consentimientos):** El "interruptor" de privacidad. Cada psicólogo decide qué recursos (citas, pacientes, notas) otorga a la clínica.

### El flujo de privacidad
En Adaptia, los datos nunca viajan directamente entre miembros. Todo sucede a través de la entidad **Clínica**:
- El Miembro **otorga** a la Clínica.
- La Clínica **distribuye** a los miembros con la Capacidad necesaria.
- **Resultado:** Si un psicólogo retira su consentimiento, sus datos desaparecen instantáneamente de la vista de los demás, incluso de los administradores.

## 🛠️ Estructura del Proyecto
- `src/auth/permissions.js`: Lógica maestra de validación.
- `src/auth/models.js`: Definición de Miembros, Citas y Pacientes.
- `src/auth/filters.js`: Motor encargado de limpiar los datos antes de que lleguen a la interfaz.

## 🧪 Pruebas Rápidas
Para verificar la lógica de permisos actual:
```bash
node index.js