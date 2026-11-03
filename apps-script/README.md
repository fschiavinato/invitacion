# Formularios → Google Sheets

1. Crear una planilla nueva en Google Sheets (ej. "Boda — Respuestas").
2. Menú **Extensiones → Apps Script**. Borrar el contenido y pegar `Code.gs`. Guardar.
3. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
4. Autorizar los permisos (Google avisa "app no verificada": *Configuración avanzada → Ir a…*).
5. Copiar la URL que termina en `/exec` y pegarla en `SHEETS_URL` dentro de `index.html`.

Las pestañas "Confirmaciones", "Reservas de hotel" y "Canciones" se crean solas con el primer envío.

Si después modificás `Code.gs`: **Implementar → Gestionar implementaciones → editar → Versión: nueva**.
Así la URL sigue siendo la misma.
