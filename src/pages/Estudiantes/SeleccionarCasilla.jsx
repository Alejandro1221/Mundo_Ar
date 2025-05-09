import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerCasillasPorJuego } from "../../services/databaseService";
import volverIcono from "../../assets/images/volver.png";
//import caminoImg from "../../assets/images/imag1.jpeg"; 
import caminoImg from "../../assets/images/image1.png"; 
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

  // Posiciones ajustadas para que las casillas sigan el camino
  const posiciones = [
    { top: "83%", left: "59%" }, // 1
    { top: "79%", left: "50%" }, // 2
    { top: "73%", left: "41%" }, // 3
    { top: "82%", left: "37%" }, // 4
    { top: "89%", left: "29%" }, // 5
    { top: "84%", left: "20%" }, // 6
    { top: "73%", left: "16%" }, // 7
    { top: "61%", left: "16%" }, // 8
    { top: "48%", left: "18%" }, // 9
    { top: "44%", left: "27%" }, // 10
    { top: "50%", left: "35%" }, // 11
    { top: "56%", left: "43%" }, // 12
    { top: "59%", left: "52%" }, // 13
    { top: "59%", left: "61%" }, // 14
    { top: "56%", left: "71%" }, // 15
    { top: "47%", left: "77%" }, // 16
    { top: "48%", left: "76%" }, // 17
    { top: "36%", left: "78%" }, // 18
    { top: "30%", left: "70%" }, // 19
    { top: "34%", left: "62%" }, // 20
    { top: "36%", left: "53%" }, // 21
    { top: "35%", left: "43%" }, // 22
    { top: "32%", left: "34%" }, // 23
    { top: "27%", left: "26%" }, // 24
    { top: "19%", left: "19%" }, // 25
    { top: "7%",  left: "21%" }, // 26
    { top: "4%",  left: "30%" }, // 27
    { top: "10%", left: "38%" }, // 28
    { top: "17%", left: "46%" }, // 29
    { top: "21%",  left: "54%" } // 30

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
      "rompecabezas-modelo": `/estudiante/actividad-rompecabezas/${index + 1}`,
      "modelo-texto": `/estudiante/actividad-modelo-texto/${index + 1}` 
     
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
            onClick={() => {
              sessionStorage.setItem("casillaId", index);
              navigate("/estudiante/verificar-casilla");
            }}
            title={casilla.plantilla || "Sin marcador asignado"}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};
  
  
export default SeleccionarCasilla;