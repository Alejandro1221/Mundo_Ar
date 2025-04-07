import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerCasillasPorJuego } from "../../services/databaseService";
import volverIcono from "../../assets/images/volver.png";
import caminoImg from "../../assets/images/imag1.jpeg"; 
import "../../assets/styles/estudiante/SeleccionarCasilla.css"; 

const SeleccionarCasilla = () => {
  const navigate = useNavigate();
  const [casillas, setCasillas] = useState([]);

  useEffect(() => {
      const cargarCasillas = async () => {
        const idGuardado = sessionStorage.getItem("juegoId");
        console.log("🎮 ID obtenido en SeleccionarCasilla:", idGuardado);
        
        if (!idGuardado) {
          console.warn("⚠️ No se encontró juegoId en sessionStorage. Redirigiendo...");
          navigate("/estudiante/dashboard");
          return;
        }
  
        try {
          const casillasObtenidas = await obtenerCasillasPorJuego(idGuardado);
          console.log("🔍 Casillas obtenidas desde Firestore:", casillasObtenidas);
          setCasillas(casillasObtenidas);
        } catch (error) {
          console.error("❌ Error al cargar casillas:", error);
        }
      };
  
      cargarCasillas();
    }, [navigate]);

  // 🔹 Posiciones ajustadas para que las casillas sigan el camino
  const posiciones = [
    { top: "90%", left: "38%" }, // 1
    { top: "88%", left: "50%" }, // 2
    { top: "85%", left: "60%" }, // 3
    { top: "80%", left: "70%" }, // 4
    { top: "70%", left: "75%" }, // 5
    { top: "65%", left: "65%" }, // 6
    { top: "64%", left: "55%" }, // 7
    { top: "64%", left: "45%" }, // 8
    { top: "64%", left: "35%" }, // 9
    { top: "63%", left: "25%" }, // 10
    { top: "58%", left: "16%" }, // 11
    { top: "50%", left: "18%" }, // 12
    { top: "48%", left: "28%" }, // 13
    { top: "50%", left: "38%" }, // 14
    { top: "52%", left: "48%" }, // 15
    { top: "51%", left: "58%" }, // 16
    { top: "48%", left: "66%" }, // 17
    { top: "43%", left: "70%" }, // 18
    { top: "38%", left: "61%" }, // 19
    { top: "39%", left: "50%" }, // 20
    { top: "39%", left: "39%" }, // 21
    { top: "34%", left: "29%" }, // 22
    { top: "26%", left: "33%" }, // 23
    { top: "26%", left: "44%" }, // 24
    { top: "26%", left: "55%" }, // 25
    { top: "18%", left: "64%" }, // 26
    { top: "13%", left: "55%" }, // 27
    { top: "15%", left: "45%" }, // 28
    { top: "10%", left: "38%" }, // 29
    { top: "2%",  left: "48%" } // 30

  ];

  // Función para redirigir a la plantilla correspondiente según la casilla seleccionada
  const irAPlantilla = (index) => {
    const casillaSeleccionada = casillas[index];
  
    if (!casillaSeleccionada || !casillaSeleccionada.plantilla) {
      alert("⚠️ Esta casilla no tiene una plantilla configurada.");
      return;
    }
  
    console.log(`🎯 Casilla seleccionada: ${index + 1}, Plantilla asignada: ${casillaSeleccionada.plantilla}`);
  
    sessionStorage.setItem("casillaId", index);
  
    const rutasPlantillas = {
      "modelo-sonido": `/estudiante/actividad-modelo-sonidos/${index + 1}`,
      "clasificacion-modelos": `/estudiante/actividad-clasificacion-modelos/${index + 1}`,
    };
  
    const ruta = rutasPlantillas[casillaSeleccionada.plantilla];
  
    if (ruta) {
      console.log(`🚀 Redirigiendo a: ${ruta}`);
      navigate(ruta);
    } else {
      alert("⚠️ La plantilla seleccionada no está disponible.");
    }
  };

  return (
    <div className="tablero-container">
      <div className="encabezado-casilla">
        <img src={volverIcono} alt="Volver" className="volver-esquina-superior"
          onClick={() => navigate("/estudiante/dashboard")}
        />
        <h2>Selecciona una Casilla</h2>
      </div>

      <div className="camino-container">
        <img src={caminoImg} alt="Camino de juego" className="fondo-camino" />

        {casillas.map((casilla, index) => (
          <div 
            key={index} 
            className="casilla"
            style={{ top: posiciones[index].top, left: posiciones[index].left }}
            onClick={() => irAPlantilla(index)} 
            title={casilla.plantilla || "Sin plantilla asignada"}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
  
  
export default SeleccionarCasilla;