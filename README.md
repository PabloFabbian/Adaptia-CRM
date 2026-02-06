# Adaptia 🧠 - Gestión Clínica Colaborativa

**Adaptia** es una plataforma de gestión para clínicas diseñada bajo un paradigma de colaboración horizontal. A diferencia de los sistemas rígidos, Adaptia permite que los profesionales crezcan juntos manteniendo su autonomía y privacidad mediante un sistema de gobernanza dinámica.

## 🚀 El Corazón de Adaptia: Gobernanza y Permisos

El sistema se rige por un motor de permisos híbrido que garantiza tanto la operatividad técnica como la privacidad de los datos:

### 1. Sistema RBAC (Role-Based Access Control)
Basado en una estructura de tres niveles sincronizada con la base de datos (**Neon DB**):
* **Roles:** Definiciones globales (ej: `Tech Owner`, `Administrador`, `Psicólogo`).
* **Capabilities (Capacidades):** Slugs técnicos (ej: `clinic.patients.read`) que definen qué acciones puede ejecutar un rol.
* **Members:** La tabla relacional que vincula Usuarios con Sedes, determinando qué rol desempeña cada usuario en cada clínica específica.



### 2. Bypass de Gobernanza (Master Mode)
Para garantizar la operatividad total y el soporte técnico, el sistema implementa un **Bypass Maestro** para el rol de **Tech Owner** (ID: 17):
- Los usuarios con este rol omiten las validaciones restrictivas de `userPermissions`.
- Acceso garantizado a módulos críticos: **Gobernanza de Sedes**, **Facturación Global**, **Categorías de Sistema** y **Papelera de Recuperación**.
- Habilitación automática de contexto de clínica para navegación ininterrumpida.

## 🛠️ Arquitectura Técnica

### Frontend (React + Context API)
- `src/context/AuthContext.jsx`: El cerebro del sistema. Gestiona la hidratación del usuario, normaliza la estructura de datos proveniente de la DB y refresca las capacidades en tiempo real.
- `src/components/Sidebar.jsx`: Interfaz adaptativa que utiliza el hook `hasRole` y la lógica de `checkPerm` para reconfigurarse según el rango del usuario.
- `src/components/ClinicSelector.jsx`: Componente de control de contexto que asegura que siempre haya una sede activa seleccionada para filtrar la información.

### Backend & Datos
- **Tabla `members`**: Registro maestro de vinculación.
- **Tabla `role_capabilities`**: Mapa relacional que conecta los roles con sus capacidades permitidas.
- **Normalización**: El sistema maneja una lógica de fallback para detectar membresías tanto en arrays dedicados como en objetos de clínica activa.

## 🔒 Flujo de Privacidad y Consentimientos
En Adaptia, los datos sensibles operan bajo un modelo de **Consentimiento Otorgado**:
1.  El Profesional **otorga** acceso de sus recursos a la Clínica.
2.  La Clínica **distribuye** visibilidad a los miembros que poseen la "Capacidad" necesaria.
3.  **Revocación Instantánea:** Si un profesional retira su consentimiento, sus datos desaparecen de la vista administrativa de la clínica de forma inmediata, protegiendo su propiedad intelectual y clínica.

## 🧪 Verificación de Estado
Para validar el estado actual de un usuario y su jerarquía en la consola del navegador (`F12`):
```javascript
// Verificar usuario e identificación de membresía
console.log(JSON.parse(localStorage.getItem('adaptia_user')));

// Verificar clínica activa y ID de rol asignado
console.log(JSON.parse(localStorage.getItem('adaptia_active_clinic')));