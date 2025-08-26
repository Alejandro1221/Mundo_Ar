// Cargar configuración de modelos
const cargarConfiguracion = async () => {
  try {
    // Primero intenta cargar desde sessionStorage
    const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
    const modelosGuardados = sessionStorage.getItem(key);
    const celebracionGuardada = sessionStorage.getItem("celebracionSeleccionada");
    const celebracionPorCasilla = sessionStorage.getItem(`celebracion_${juegoId}_${casillaId}`); // ⬅️ NUEVO

    if (modelosGuardados) {
      const nuevos = JSON.parse(modelosGuardados);
      setModelosSeleccionados(nuevos.map((m) => ({ ...m, texto: m.texto || "" })));

      const origenCelebracion = celebracionPorCasilla || celebracionGuardada; // ⬅️ NUEVO
      if (origenCelebracion) {
        try { setCelebracion(JSON.parse(origenCelebracion)); } catch {}
      }

      cargadoDesdeSession.current = true;
      return;
    }

    // Si no, cargar desde Firestore
    if (cargadoDesdeSession.current) return;
    const juegoRef = doc(db, "juegos", juegoId);
    const juegoSnap = await getDoc(juegoRef);

    if (juegoSnap.exists()) {
      const dataJuego = juegoSnap.data();
      const casilla = dataJuego.casillas?.[casillaId];

      if (casilla?.configuracion?.modelos?.length > 0) {
        const modelosConTexto = casilla.configuracion.modelos.map((modelo) => ({
          ...modelo,
          texto: modelo.texto || "",
        }));

        setModelosSeleccionados(modelosConTexto);
        sessionStorage.setItem(key, JSON.stringify(modelosConTexto)); // ⬅️ NUEVO (cachear modelos)
      }

      if (casilla?.configuracion?.celebracion) { // ⬅️ NUEVO (cargar y cachear celebración)
        setCelebracion(casilla.configuracion.celebracion);
        sessionStorage.setItem(
          `celebracion_${juegoId}_${casillaId}`,
          JSON.stringify(casilla.configuracion.celebracion)
        );
        sessionStorage.setItem(
          "celebracionSeleccionada",
          JSON.stringify(casilla.configuracion.celebracion)
        );
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar configuración:", error);
  }
};
