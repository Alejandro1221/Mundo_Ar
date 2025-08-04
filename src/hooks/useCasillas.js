import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; 
import { obtenerCasillas, actualizarCasillas, eliminarCasilla } from "../services/casillasService";

export const useCasillas = (juegoId) => {
  const navigate = useNavigate();
  const [casillas, setCasillas] = useState(Array(30).fill({ plantilla: null }));
  const [modalVisible, setModalVisible] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");
  const [casillaSeleccionada, setCasillaSeleccionada] = useState(null);

  // Validar datos al cargar casillas
  const cargarCasillas = useCallback(async () => {
    let casillasCargadas = await obtenerCasillas(juegoId);
    
    if (!Array.isArray(casillasCargadas) || casillasCargadas.length !== 30) {
      console.warn("Datos de casillas corruptos o incompletos. Reiniciando estructura.");
      casillasCargadas = Array(30).fill({ plantilla: null });
    }
    
    setCasillas(casillasCargadas);
  }, [juegoId]);

  //  Mapeo de rutas según la plantilla seleccionada
  const rutasPlantillas = {
    "modelo-sonido": "/docente/plantilla-sonido-modelo",
    "clasificacion-modelos": "/docente/clasificacion-modelos",
    "rompecabezas-modelo":"/docente/rompecabezas-modelo",
    "modelo-texto": "/docente/modelo-texto",
    "casilla-sorpresa": "/docente/casilla-sorpresa"
  };

  const abrirModal = (index, plantillaActual) => {
    setCasillaSeleccionada(index);
    setPlantillaSeleccionada(plantillaActual || "");
    setModalVisible(true);
  };

  // Solo actualizar la casilla modificada en Firestore
  const guardarCambios = async () => {
    if (casillaSeleccionada === null || !plantillaSeleccionada) {
      alert("Seleccione una plantilla.");
      return;
    }

    const nuevasCasillas = [...casillas];
    nuevasCasillas[casillaSeleccionada] = { plantilla: plantillaSeleccionada };

    await actualizarCasillas(juegoId, casillaSeleccionada, plantillaSeleccionada); 
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

  const eliminarPlantilla = async (juegoId, index) => {
    await eliminarCasilla(juegoId, index);
    const nuevas = [...casillas];
    nuevas[index] = { plantilla: null };
    setCasillas(nuevas);
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
    casillaSeleccionada,
    eliminarPlantilla
  };
};
