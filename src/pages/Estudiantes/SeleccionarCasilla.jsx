import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerCasillasPorJuego } from "../../services/databaseService";
import volverIcono from "../../assets/images/volver.png";
import caminoImg from "../../assets/images/image1.png"; 
import "../../assets/styles/estudiante/SeleccionarCasilla.css"; 

const SeleccionarCasilla = () => {
  const navigate = useNavigate();
  const [casillas, setCasillas] = useState([]);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("flashMsg");
    if (raw) {
      try {
        setFlash(JSON.parse(raw));
      } catch {}
      sessionStorage.removeItem("flashMsg"); 
    }
  }, []);

  useEffect(() => {
      if (!flash) return;
      const t = setTimeout(() => setFlash(null), 5000);
      return () => clearTimeout(t);
    }, [flash]);

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


  // Posiciones del tablero
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
    { top: "36%", left: "78%" }, // 17
    { top: "30%", left: "70%" }, // 18
    { top: "34%", left: "62%" }, // 29
    { top: "36%", left: "53%" }, // 20
    { top: "35%", left: "43%" }, // 21
    { top: "32%", left: "34%" }, // 22
    { top: "27%", left: "26%" }, // 23
    { top: "19%", left: "19%" }, // 24
    { top: "7%",  left: "21%" }, // 25
    { top: "4%",  left: "30%" }, // 26
    { top: "10%", left: "38%" }, // 27
    { top: "17%", left: "46%" }, // 28
    { top: "22%", left: "54%" }, // 29
    { top: "18%", left: "63%" }, // 30
  ];

 
  return (
    <div className="tablero-container">
      <div className="encabezado-casilla">
        <img src={volverIcono} alt="Volver" className="volver-esquina-superior"
          onClick={() => navigate("/estudiante/dashboard")}
        />
        <h2>Selecciona una Casilla</h2>
      </div>
      
      {flash && (
        <div className={`flash flash-${flash.tipo}`} role="alert">
          <div className="flash-content">
            <div className="flash-title">{flash.titulo}</div>
            <div className="flash-message">{flash.mensaje}</div>
          </div>
          <button
            className="flash-close"
            aria-label="Cerrar"
            onClick={() => setFlash(null)}
          >
            ✕
          </button>
        </div>
      )}

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