import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Importar useNavigate para navegación interna
import { obtenerCasillas, actualizarCasillas } from "../services/casillasService";

export const useCasillas = (juegoId) => {
  const navigate = useNavigate(); // ✅ Hook para cambiar de página dentro de la app
  const [casillas, setCasillas] = useState(Array(30).fill({ plantilla: null }));
  const [modalVisible, setModalVisible] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");
  const [casillaSeleccionada, setCasillaSeleccionada] = useState(null);

  const cargarCasillas = useCallback(async () => {
    const casillasCargadas = await obtenerCasillas(juegoId);
    setCasillas(casillasCargadas);
  }, [juegoId]);

  const abrirModal = (index, plantillaActual) => {
    if (plantillaActual) {
    
      if (plantillaActual === "modelo-sonido") {
        sessionStorage.setItem("juegoId", juegoId);
        sessionStorage.setItem("casillaId", index);
        navigate("/plantilla-sonido-modelo");
      } else {
        alert(`La plantilla "${plantillaActual}" aún no tiene configuración implementada.`);
      }
      return; 
    }
  

    setCasillaSeleccionada(index);
    setModalVisible(true);
  };
  

  const guardarCambios = async () => {
    if (casillaSeleccionada === null || !plantillaSeleccionada) {
      alert("Seleccione una plantilla.");
      return;
    }

    const nuevasCasillas = [...casillas];
    nuevasCasillas[casillaSeleccionada] = { plantilla: plantillaSeleccionada };

    await actualizarCasillas(juegoId, nuevasCasillas);
    setCasillas(nuevasCasillas);
    setModalVisible(false);

    // ✅ En lugar de abrir en nueva pestaña, usamos navigate() para cambiar de página dentro de la app
    if (plantillaSeleccionada === "modelo-sonido") {
      sessionStorage.setItem("juegoId", juegoId);
      sessionStorage.setItem("casillaId", casillaSeleccionada);
      navigate("/plantilla-sonido-modelo"); // ✅ Redirección interna en React
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
