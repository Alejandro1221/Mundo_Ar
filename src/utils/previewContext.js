// utils/previewContext.js
const TEMP_KEYS_BASE = [
  "modoVistaPrevia",
  "paginaAnterior",
  "returnTo",
  "modelosSeleccionados",
  "seleccionandoModelos",
  "gruposSeleccionados",
  "asignacionesModelos",
  "celebracionSeleccionada",
  // 👇 nota: NO incluimos juegoId ni casillaId
];

export function setPreviewContext({ juegoId, casillaId, fromPath }) {
  sessionStorage.setItem("modoVistaPrevia", "true");
  sessionStorage.setItem("paginaAnterior", fromPath || window.location.pathname);
  if (juegoId) sessionStorage.setItem("juegoId", juegoId);
  if (casillaId != null) sessionStorage.setItem("casillaId", casillaId);
  if (juegoId) sessionStorage.setItem("returnTo", `/docente/configurar-casillas/${juegoId}`);
}

export function clearPreviewContext() {
  const juegoId = sessionStorage.getItem("juegoId");
  const casillaId = sessionStorage.getItem("casillaId");

  const namespaced = [
    `modelosSeleccionados_${juegoId ?? ""}_${casillaId ?? ""}`,
  ];

  // ⚠️ No borres juegoId ni casillaId aquí
  [...TEMP_KEYS_BASE, ...namespaced].forEach(k => sessionStorage.removeItem(k));
}

export function getReturnTarget() {
  const returnTo = sessionStorage.getItem("returnTo");
  const paginaAnterior = sessionStorage.getItem("paginaAnterior");
  const juegoId = sessionStorage.getItem("juegoId");
  const casillaId = sessionStorage.getItem("casillaId");

  // ✅ preferir juego + casilla específicos
  if (juegoId && casillaId !== null && casillaId !== undefined) {
    return `/docente/configurar-casillas/${juegoId}/${casillaId}`;
  }

  // fallback seguros
  return (
    returnTo ||
    (juegoId ? `/docente/configurar-casillas/${juegoId}` : null) ||
    paginaAnterior ||
    "/docente/dashboard"
  );
}
