
useEffect(() => {
  if (!juegoId || !casillaId) return;

  const key = `modelosSeleccionados_${juegoId}_${casillaId}`;
  const modelosGuardados = sessionStorage.getItem(key);

  if (modelosGuardados) {
    const nuevos = JSON.parse(modelosGuardados);
    console.log("📥 Modelos recuperados desde sessionStorage:", nuevos);

    // Fusionar con los ya seleccionados (sin duplicar por URL)
    const yaExistentes = modelosSeleccionados || [];
    const nuevosSinRepetir = nuevos.filter(
      (nuevo) => !yaExistentes.some((m) => m.url === nuevo.url)
    );

    const fusionados = [...yaExistentes, ...nuevosSinRepetir];
    setModelosSeleccionados(fusionados);

    // Actualiza asignaciones
    const nuevasAsignaciones = {};
    fusionados.forEach((modelo) => {
      nuevasAsignaciones[modelo.url] = modelo.texto || "";
    });
    setAsignaciones(nuevasAsignaciones);

    sessionStorage.removeItem(key);
    modelosCargadosDesdeSession.current = true;

    setMensaje({ texto: "✅ Modelos actualizados desde el banco.", tipo: "success" });
    setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
  }
}, [juegoId, casillaId]);
