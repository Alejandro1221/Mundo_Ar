const cargarConfiguracion = async () => {
  try {
    let modelos = [];

    // 1. Cargar desde sessionStorage si hay
    const modelosGuardados = sessionStorage.getItem("modelosSeleccionados");
    if (modelosGuardados) {
      try {
        const parsed = JSON.parse(modelosGuardados);
        if (Array.isArray(parsed)) {
          modelos = parsed;
          console.log("✅ Modelos cargados desde sessionStorage:", parsed);
        }
      } catch (err) {
        console.warn("⚠️ Error al parsear modelos desde sessionStorage", err);
      }
    }

    // 2. Si no hay modelos, o si vienes desde una ruta directa, carga desde Firestore
    if (modelos.length === 0) {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const dataJuego = juegoSnap.data();
        const casilla = dataJuego.casillas[casillaId];

        if (casilla?.configuracion?.modelos?.length > 0) {
          modelos = casilla.configuracion.modelos;
          console.log("📥 Modelos cargados desde Firestore:", modelos);
        }
      }
    }

    // 3. Aplicar asignaciones de texto
    const nuevasAsignaciones = {};
    const modelosConTexto = modelos.map((modelo) => {
      const texto = modelo.texto || "";
      nuevasAsignaciones[modelo.url] = texto;
      return { ...modelo, texto };
    });

    setModelosSeleccionados(modelosConTexto);
    setAsignaciones(nuevasAsignaciones);
  } catch (error) {
    console.error("Error al cargar configuración:", error);
  }
};
