import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function patchSessionStorageOnce() {
  if (window.__ss_patched) return;
  window.__ss_patched = true;

  const origSet = window.sessionStorage.setItem;
  const origRem = window.sessionStorage.removeItem;
  const origClr = window.sessionStorage.clear;

  window.sessionStorage.setItem = function (k, v) {
    console.log("%c[SS setItem]", "color:#0a0", k, "=", v);
    return origSet.apply(this, arguments);
  };
  window.sessionStorage.removeItem = function (k) {
    console.log("%c[SS removeItem]", "color:#a50", k);
    return origRem.apply(this, arguments);
  };
  window.sessionStorage.clear = function () {
    console.log("%c[SS clear]", "color:#a00");
    return origClr.apply(this, arguments);
  };
}

export default function FlowTracer() {
  const location = useLocation();

  useEffect(() => {
    patchSessionStorageOnce();
  }, []);

  useEffect(() => {
    const snapshot = {
      path: location.pathname + location.search,
      juegoId: sessionStorage.getItem("juegoId"),
      casillaId: sessionStorage.getItem("casillaId"),
      modoVistaPrevia: sessionStorage.getItem("modoVistaPrevia"),
      paginaAnterior: sessionStorage.getItem("paginaAnterior"),
      ts: new Date().toISOString(),
    };
    console.log("%c[Route]", "color:#09f", snapshot);
  }, [location]);

  return null;
}
