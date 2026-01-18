# Correcciones en Sistema de Cambio de Contraseñas

## Fecha: 12 de Enero de 2026

## Problemas Identificados y Solucionados

### 1. ❌ Error en el Servidor al Cambiar Contraseña

**Problema:**
- El endpoint `/api/usuarios/:id/contrasena` estaba causando un error 500 al intentar cambiar contraseñas
- El código usaba `result.changes` pero el resultado de MySQL/SQLite retorna `affectedRows`
- Se usaban comillas dobles (`"`) para strings literales en SQL, lo cual causaba errores en SQLite

**Solución:**
- Se corrigió el acceso a la propiedad: `result.affectedRows` en lugar de `result.changes`
- Se cambiaron todas las comillas dobles por comillas simples en las consultas SQL
- Se mejoró el manejo de errores y logs para debugging

**Archivos Modificados:**
- [server.js](server.js#L326-L404)

### 2. ✅ Nueva Funcionalidad: Historial de Contraseñas

**Implementación:**
Se creó un sistema completo para prevenir que los usuarios reutilicen contraseñas anteriores.

**Características:**
- Nueva tabla `historial_contrasenas` que almacena hasta 5 contraseñas anteriores por usuario
- Validación automática al cambiar contraseña que compara con el historial
- Mensaje claro al usuario si intenta usar una contraseña anterior
- Migración automática de contraseñas existentes al historial

**Archivos Creados:**
- [migrations/add-historial-contrasenas.sql](migrations/add-historial-contrasenas.sql) - Schema SQL
- [migrations/add-historial-contrasenas.js](migrations/add-historial-contrasenas.js) - Script de migración
- [test-cambio-contrasena.js](test-cambio-contrasena.js) - Tests automatizados

**Archivos Modificados:**
- [server.js](server.js#L326-L404) - Endpoint actualizado con validación de historial

## Estructura de la Tabla de Historial

```sql
CREATE TABLE historial_contrasenas (
  IdHistorial INTEGER PRIMARY KEY AUTOINCREMENT,
  Usuario INT NOT NULL,
  ContrasenaHash VARCHAR(255) NOT NULL,
  FechaCambio DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Flujo del Cambio de Contraseña

1. **Validaciones de Formato:**
   - Mínimo 6 caracteres
   - Al menos una letra mayúscula
   - Al menos un número
   - Al menos un carácter especial

2. **Validación de Usuario:**
   - Verifica que el usuario existe en la base de datos

3. **Validación de Historial (NUEVO):**
   - Obtiene las últimas 5 contraseñas del usuario
   - Compara la nueva contraseña con cada una del historial usando bcrypt
   - Si coincide con alguna, rechaza el cambio con mensaje claro

4. **Actualización:**
   - Hashea la nueva contraseña con bcrypt
   - Actualiza la tabla `credenciales`
   - Guarda el hash en la tabla `historial_contrasenas`
   - Marca `ContrasenaTemporal = 'No'`

## Mensajes de Error Mejorados

- ✅ "Contraseña actualizada correctamente."
- ❌ "Esta contraseña ya fue utilizada anteriormente. Por favor, elige una contraseña diferente."
- ❌ "Usuario no encontrado."
- ❌ "La contraseña debe tener al menos 6 caracteres."
- ❌ "La contraseña debe contener al menos una letra mayúscula."
- ❌ "La contraseña debe contener al menos un número."
- ❌ "La contraseña debe contener al menos un carácter especial."

## Compatibilidad

- ✅ Compatible con MySQL
- ✅ Compatible con SQLite (usado como fallback)
- ✅ Maneja correctamente las diferencias de sintaxis entre bases de datos

## Testing

Se creó un script de pruebas automatizadas (`test-cambio-contrasena.js`) que verifica:
1. Cambio exitoso de contraseña
2. Detección de contraseña ya usada
3. Validación de formato (mayúsculas, números, caracteres especiales)
4. Validación de longitud mínima
5. Manejo de usuarios no existentes

## Cómo Usar

### Para Aplicar la Migración:
```bash
node migrations/add-historial-contrasenas.js
```

### Para Ejecutar Pruebas:
```bash
node test-cambio-contrasena.js
```

## Logs del Servidor

Ahora el servidor proporciona logs detallados:
```
🔐 Actualizando contraseña para usuario: 1019103194
⚠️ La contraseña ya fue utilizada anteriormente por el usuario: 1019103194
✅ Contraseña actualizada para usuario: 1019103194
```

## Seguridad

- Todas las contraseñas se almacenan hasheadas con bcrypt (salt rounds: 10)
- La comparación de contraseñas usa bcrypt.compare() para comparar de forma segura
- No se almacenan contraseñas en texto plano en ningún momento
- El historial mantiene solo las últimas 5 contraseñas

## Nota Importante

El error `⚠️ Error en statement SQL: UNIQUE constraint failed: categoria.NombreCategoria` que aparece en los logs es normal y no afecta el funcionamiento del sistema. Es causado por la inicialización del schema SQL que intenta insertar categorías que ya existen.
