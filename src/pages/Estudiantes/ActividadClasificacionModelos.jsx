import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useAR } from "../../hooks/useAR";
import "../../assets/styles/estudiante/ActividadClasificacionModelos.css";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";
import { CELEBRACIONES } from "../../utils/celebraciones";
import "../../aframe/seleccionable";

const ActividadClasificacionModelos = ({ vistaPrevia = false }) => {
  useAR();
  const navigate = useNavigate();
  const [modelos, setModelos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [celebracion, setCelebracion] = useState({ tipo: "mensaje", opciones: {} });
  const [modelosClasificados, setModelosClasificados] = useState([]);
  const [modeloActivo, setModeloActivo] = useState(null);
  const [instrucciones, setInstrucciones] = useState("");
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false);
  const enVistaPrevia =
    Boolean(vistaPrevia) || sessionStorage.getItem("modoVistaPrevia") === "true";

  const juegoId = sessionStorage.getItem("juegoId");
  const casillaId = sessionStorage.getItem("casillaId");


  useEffect(() => {
    window.modeloActivoUrl = modeloActivo;
  }, [modeloActivo]);

  useEffect(() => {
    if (enVistaPrevia) {
      const modelos = JSON.parse(sessionStorage.getItem("modelosSeleccionados") || "[]");
      const gruposGuardados = JSON.parse(sessionStorage.getItem("gruposSeleccionados") || "[]");
      const deducidos = [...new Set(modelos.map(m => m.grupo).filter(Boolean))];
      const grupos = deducidos.length ? deducidos : gruposGuardados;
      const celebracion = JSON.parse(sessionStorage.getItem("celebracionSeleccionada") || "{}");

      setModelos(modelos);
      setGrupos(grupos);
      setCelebracion(celebracion);
      return;
    }

   if (!juegoId || !casillaId) {
     const back = sessionStorage.getItem("paginaAnterior") || "/docente/dashboard";
     navigate(back, { replace: true });
     return;
   }
    const cargarConfiguracion = async () => {
      const juegoRef = doc(db, "juegos", juegoId);
      const juegoSnap = await getDoc(juegoRef);

      if (juegoSnap.exists()) {
        const casilla = juegoSnap.data().casillas[casillaId];
        if (casilla?.configuracion) {
          setModelos(casilla.configuracion.modelos || []);
          setGrupos(casilla.configuracion.grupos || []);
          setInstrucciones(casilla.configuracion.instrucciones || "");
          setCelebracion(casilla.configuracion.celebracion || { tipo: "mensaje", opciones: {} });
        } else {
          alert("⚠️ Esta casilla no tiene configuración.");
        }
      }
    };

    cargarConfiguracion();

    return () => {
      if (enVistaPrevia) sessionStorage.removeItem("modoVistaPrevia");
    };
  }, [enVistaPrevia, juegoId, casillaId, navigate]);
  
  useEffect(() => {
    window.verificarClasificacion = (modeloEl) => {
      console.log("Verificando clasificación de:", modeloEl.getAttribute("data-modelo-url")); 
      const categoriaModelo = modeloEl.getAttribute("grupo");
      const posicionModelo = new THREE.Vector3();
      modeloEl.object3D.getWorldPosition(posicionModelo);

      document.querySelectorAll("a-box[categoria]").forEach((zona) => {
        const categoriaZona = zona.getAttribute("categoria");
        const posicionZona = new THREE.Vector3();
        zona.object3D.getWorldPosition(posicionZona);

        const distancia = posicionModelo.distanceTo(posicionZona);
        if (distancia < 0.2 && categoriaModelo === categoriaZona) {
          zona.setAttribute("material", "color:rgb(90, 216, 199); opacity: 0.9; transparent: true");

          modeloEl.setAttribute("position", {
            x: zona.getAttribute("position").x,
            y: zona.getAttribute("position").y + 0.25,
            z: zona.getAttribute("position").z
          });

          modeloEl.setAttribute("scale", "0.08 0.08 0.08");
          modeloEl.removeAttribute("seleccionable");

          mostrarFeedback("¡Correcto!");
          setModelosClasificados((prev) => {
            const nuevosClasificados = [...prev, modeloEl.getAttribute("data-modelo-url")];
            if (nuevosClasificados.length === modelos.length) {
              mostrarCelebracion(); 
            }
            return nuevosClasificados;
          });


        }
      });
    };
  }, [grupos]);

  const mostrarFeedback = (texto) => {
    const prev = document.getElementById("mensaje-feedback");
    if (prev) prev.remove();
    
    
    const mensaje = document.createElement("a-text");
    mensaje.setAttribute("value", texto);
    mensaje.setAttribute("color", "#63CEE0");
    mensaje.setAttribute("position", "0 -0.2 -1"); 
    mensaje.setAttribute("align", "center");
    mensaje.setAttribute("scale", "0.3 0.3 0.3");
    mensaje.setAttribute("id", "mensaje-feedback");
    mensaje.setAttribute("side", "double");
    mensaje.setAttribute("look-at", "[camera]");
    
    const cam = document.querySelector("a-entity[camera]");
    if (cam) {
      cam.appendChild(mensaje);
    }
  
    setTimeout(() => {
      if (mensaje && mensaje.parentNode) mensaje.remove();
    }, 2000);
  };

 const mostrarCelebracion = () => {
  const tipo = celebracion?.tipo;
  const opciones = celebracion?.opciones || {};

  console.log("Tipo de celebración:", tipo, opciones);

  if (CELEBRACIONES[tipo] && typeof CELEBRACIONES[tipo].render === "function") {
    CELEBRACIONES[tipo].render(opciones);
  } else {
    console.warn("❗ Tipo de celebración no reconocido:", tipo);
  }
};

  return (
    <div className="actividad-ra-container">
      <HeaderActividad titulo="Clasifica los modelos en la categoria correspondiente" />
      <a-scene
        arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
        background="transparent: true"
      >
        {grupos.map((grupo, index) => {
          const x = (index - (grupos.length - 1) / 2) * 1; // igual que la caja
          const yBox = -0.6;
          const z = -3;

          return (
            <a-entity key={index}>
              <a-box
                categoria={grupo}
                position={`${x} ${yBox} ${z}`}
                depth="0.3" height="0.3" width="0.3"
                color="#4CAF50"
                material="opacity: 0.5; transparent: true"
              ></a-box>

              <a-text
                value={grupo || ""}
                position={`${x} ${yBox - 0.25} ${z}`}  // misma x/z; un poco más abajo
                align="center"
                anchor="center"
                wrap-count="14"
                width="1.8"
                scale="1 1 1"
                color="#ffffff"
                side="double"
                look-at="[camera]"
                className="texto-grupo"                 // en React usa className
                /* Si quieres MSDF local:
                shader="msdf" font="#robotoFont" fontImage="#robotoFontImg"
                */
              ></a-text>
            </a-entity>
          );
        })}


        {modelos.map((modelo, index) => {
          const columnas = 3;
          const espaciado = 0.5;
          const vertical = 1.0; 
          const fila = Math.floor(index / columnas);
          const col = index % columnas;

          const x = (col - (columnas - 1) / 2) * espaciado; 
          const y = 0.5 - fila * 1.5; 
          const z = -3;

          return (
            <a-entity
              key={index}
              gltf-model={modelo.url}
              position={`${x} ${y} ${z}`}
              scale="1 1 1"
              grupo={modelo.grupo}
              seleccionable
              data-modelo-url={modelo.url}
            ></a-entity>
          );
        })}
        <a-entity camera="fov: 95" position="0 0 0"></a-entity>
      </a-scene>

      <div className="controles-modelos">
        {modelos.map((modelo, index) => (
          <button
            key={index}
            className={`btn-modelo ${modelo.url === modeloActivo ? "activo" : ""}`}
            onClick={() => setModeloActivo(modelo.url)}
          >
            {modelo.nombre}
          </button>
        ))}
      </div>
      {instrucciones && (
  <div className="boton-instrucciones">
    <button
      onMouseDown={() => setMostrarInstrucciones(true)}
      onMouseUp={() => setMostrarInstrucciones(false)}
      onTouchStart={() => setMostrarInstrucciones(true)}
      onTouchEnd={() => setMostrarInstrucciones(false)}
    >
      Instrucciones
    </button>
    {mostrarInstrucciones && (
      <div className="instrucciones-popup">
        {instrucciones}
      </div>
    )}
  </div>
)}

    </div>
  );
}

export default ActividadClasificacionModelos;

