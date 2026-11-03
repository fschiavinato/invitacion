// Recibe los formularios de la invitación y los guarda en esta planilla.
// Cada formulario va a su propia pestaña, con columnas fijas.
//
// Instalación: ver apps-script/README.md

// Pestaña y campos permitidos de cada formulario. Cualquier otro campo se ignora.
const FORMS = {
  confirmation_form: {
    sheet: "Confirmaciones",
    fields: ["nombre", "restriccion", "decision"],
  },
  reservation_form: {
    sheet: "Reservas de hotel",
    fields: ["titular", "numero_reserva", "invitados", "llegada", "salida"],
  },
  song_form: {
    sheet: "Canciones",
    fields: ["cancion"],
  },
};

// Largo máximo de cada campo (lo que sobre se recorta).
const MAX_LENGTH = 1000;

// Campo trampa: está oculto en la página, así que solo un bot lo completa.
const HONEYPOT = "website";

// Mandar un mail por cada envío (a la cuenta dueña del script).
const NOTIFY_BY_EMAIL = true;

function doPost(e) {
  const params = e.parameter;
  const form = FORMS[params._form];
  if (!form) return json({ success: false, error: "Formulario desconocido" });

  // Bot: le decimos que salió bien para que no reintente, pero no guardamos nada.
  if (params[HONEYPOT]) return json({ success: true });

  const values = form.fields.map((f) =>
    String(params[f] ?? "").trim().slice(0, MAX_LENGTH)
  );
  if (values.every((v) => v === "")) {
    return json({ success: false, error: "Formulario vacío" });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(form.sheet);
    if (!sheet) {
      sheet = ss.insertSheet(form.sheet);
      sheet.appendRow(["Fecha", ...form.fields]);
      sheet.getRange(1, 1, 1, form.fields.length + 1).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    // El apóstrofe evita que un texto que empieza con "=" se tome como fórmula.
    sheet.appendRow([new Date(), ...values.map((v) => (/^[=+\-@]/.test(v) ? "'" + v : v))]);
  } catch (err) {
    return json({ success: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_BY_EMAIL) notify(form, values);
  return json({ success: true });
}

function notify(form, values) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const body = form.fields.map((f, i) => `${f}: ${values[i]}`).join("\n");
    MailApp.sendEmail(
      Session.getEffectiveUser().getEmail(),
      `Boda Sofía & Franco — ${form.sheet}`,
      `${body}\n\nPlanilla: ${ss.getUrl()}`
    );
  } catch (err) {
    // Si falla el mail, el envío igual quedó guardado.
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
