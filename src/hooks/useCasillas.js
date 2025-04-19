import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { obtenerCasillas, actualizarCasillas } from "../services/casillasService";

export const useCasillas = (juegoId) => {
  const navigate = useNavigate();
  const [casillas, setCasillas] = useState(Array(30).fill({ plantilla: null }));
  const [modalVisible, setModalVisible] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");
  const [casillaSeleccionada, setCasillaSeleccionada] = useState(null);

  // ✅ 1. Validar datos al cargar casillas
  const cargarCasillas = useCallback(async () => {
    let casillasCargadas = await obtenerCasillas(juegoId);
    
    if (!Array.isArray(casillasCargadas) || casillasCargadas.length !== 30) {
      console.warn("Datos de casillas corruptos o incompletos. Reiniciando estructura.");
      casillasCargadas = Array(30).fill({ plantilla: null }); // 🔹 Forzar estructura correcta
    }
    
    setCasillas(casillasCargadas);
  }, [juegoId]);

  // 📌 Mapeo de rutas según la plantilla seleccionada
  const rutasPlantillas = {
    "modelo-sonido": "/docente/plantilla-sonido-modelo",
    "clasificacion-modelos": "/docente/clasificacion-modelos",
    "rompecabezas-modelo":"/docente/rompecabezas-modelo",
  };

  const abrirModal = (index, plantillaActual) => {
    if (plantillaActual) {
      const ruta = rutasPlantillas[plantillaActual];
      if (ruta) {
        sessionStorage.setItem("paginaAnterior", window.location.pathname);
        sessionStorage.setItem("juegoId", juegoId);
        sessionStorage.setItem("casillaId", index);
        navigate(ruta);
      } else {
        alert(`La plantilla "${plantillaActual}" aún no está implementada.`);
      }
      return;
    }

    setCasillaSeleccionada(index);
    setModalVisible(true);
  };

  // ✅ 2. Solo actualizar la casilla modificada en Firestore
  const guardarCambios = async () => {
    if (casillaSeleccionada === null || !plantillaSeleccionada) {
      alert("Seleccione una plantilla.");
      return;
    }

    const nuevasCasillas = [...casillas];
    nuevasCasillas[casillaSeleccionada] = { plantilla: plantillaSeleccionada };

    await actualizarCasillas(juegoId, casillaSeleccionada, plantillaSeleccionada); // 🔹 Solo actualiza una casilla
    setCasillas(nuevasCasillas);
    setModalVisible(false);

    sessionStorage.setItem("juegoId", juegoId);
    sessionStorage.setItem("casillaId", casillaSeleccionada);

    const ruta = rutasPlantillas[plantillaSeleccionada];
    if (ruta) {
      navigate(ruta);
    } else {
      alert(`La plantilla "${plantillaSeleccionada}" aún no está implementada.`);
    }
  };

  return { 
    casillas, 
    cargarCasillas, 
    abrirModal, 
    guardarCambios, 
    modalVisible, 
    setModalVisible, 
    plantillaSeleccionada, 
    setPlantillaSeleccionada, 
    casillaSeleccionada 
  };
};
