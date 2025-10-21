export const normalizarSonido = (s) => {
  if (!s) return null;
  if (typeof s === "string") return { url: s };
  if (s.url) return s;
  if (s.downloadURL) return { ...s, url: s.downloadURL };
  return s;
};

export const normalizarModelos = (lista = [], limite = 3) => {
  const out = [];
  const seen = new Set();
  for (const m of Array.isArray(lista) ? lista : []) {
    const key = m?.url || m?.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ id: m.id, url: m.url, nombre: m.nombre });
    if (out.length === limite) break;
  }
  return out;
};

export const sanitizarSonido = (s) => {
  const n = normalizarSonido(s);
  if (!n) return null;
  const { url, nombre, duracion, formato, modeloAsociado } = n;
  return { url, nombre, duracion, formato, modeloAsociado };
};

export const getIdx = (id) => {
  const idx = Number(id);
  return Number.isInteger(idx) && idx >= 0 ? idx : null;
};

export const asegurarCasillas = (casillas, idxObjetivo) => {
  const base = Array.isArray(casillas) ? [...casillas] : [];
  const len = Math.max(base.length, (idxObjetivo ?? 0) + 1, 30);
  return Array.from({ length: len }, (_, i) =>
    base[i] && typeof base[i] === "object" ? base[i] : { configuracion: null }
  );
};


