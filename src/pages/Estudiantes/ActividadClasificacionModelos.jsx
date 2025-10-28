import React, { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom"
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
  const location = useLocation();

  // --- Estados principales ---
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

  const origen =
    (location.state && location.state.from) ||
    sessionStorage.getItem("paginaAnterior") ||
    `/docente/configurar-casillas/${juegoId || ""}`;

  const MAX_MODELOS = 6;
  const GRID_COLS = 3;
  const GRID_ROWS = 2;
  const totalJugables = Math.min(modelos.length, MAX_MODELOS);

  useEffect(() => {
    window.modeloActivoUrl = modeloActivo;
  }, [modeloActivo]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("modoVistaPrevia");
    };
  }, []);



  useEffect(() => {
    if (enVistaPrevia) {
      const modelosPrev = JSON.parse(sessionStorage.getItem("modelosSeleccionados") || "[]");
      const gruposGuardados = JSON.parse(sessionStorage.getItem("gruposSeleccionados") || "[]");
      const deducidos = [...new Set(modelosPrev.map(m => m.grupo).filter(Boolean))];
      const grupos = deducidos.length ? deducidos : gruposGuardados;
      const celebracion = JSON.parse(sessionStorage.getItem("celebracionSeleccionada") || "{}");

      setModelos(modelosPrev);
      setGrupos(grupos);
      setCelebracion(celebracion);
      return;
    }
    if (!juegoId || !casillaId) {
      const back = sessionStorage.getItem("paginaAnterior") || "/docente/dashboard";
      navigate(back, { replace: true });
      return;
    }

    // Cargar configuración desde Firestore
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


  // Función para medir distancia entre modelos y zonas
  const distanciaPlano = (a, b) => {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.hypot(dx, dz);
  };


  // Verificar clasificación (llamado desde A-Frame)
  useEffect(() => {
    window.verificarClasificacion = (modeloEl) => {
      const categoriaModelo = modeloEl.getAttribute("grupo");
      const posicionModelo = new THREE.Vector3();
      modeloEl.object3D.getWorldPosition(posicionModelo);

      document.querySelectorAll("a-box[categoria]").forEach((zona) => {
        const categoriaZona = zona.getAttribute("categoria");
        const posicionZona = new THREE.Vector3();
        zona.object3D.getWorldPosition(posicionZona);

        // Distancias toleradas
        const dXZ = distanciaPlano(posicionModelo, posicionZona);
        const dY = Math.abs(posicionModelo.y - posicionZona.y);
        const UMBRAL_XZ = 0.2;
        const UMBRAL_Y = 0.25;

        // Validar coincidencia
        if (dXZ < UMBRAL_XZ && dY < UMBRAL_Y && categoriaModelo === categoriaZona) {
          zona.setAttribute("material", "color: rgb(90, 216, 199); opacity: 0.9; transparent: true");

          // Reubicar modelo en la caja
          const posZona = zona.getAttribute("position");
          modeloEl.setAttribute("position", {
            x: posZona.x,
            y: posZona.y + 0.25,
            z: posZona.z,
          });

          modeloEl.setAttribute("scale", "0.08 0.08 0.08");
          modeloEl.removeAttribute("seleccionable");

          mostrarFeedback("¡Correcto!");
          setModelosClasificados((prev) => {
            const nuevos = [...prev, modeloEl.getAttribute("data-modelo-url")];
            if (nuevos.length === totalJugables) mostrarCelebracion();
            return nuevos;
          });
        }
      });
    };
  }, [grupos, totalJugables]);


  // Mostrar feedback visual sobre la cámara

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
    if (cam) cam.appendChild(mensaje);

    setTimeout(() => {
      if (mensaje && mensaje.parentNode) mensaje.remove();
    }, 2000);
  };

  // Mostrar celebración (según configuración)
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

  // Layout de los modelos (posición y escala)
  const getFixedLayout = (n) => {
    const count = Math.min(n, MAX_MODELOS);
    const rows = count > GRID_COLS ? 2 : 1;
    const cols = GRID_COLS;

    const spaceX = 0.4;
    const spaceY = 0.4;
    const topY = rows === 1 ? 0.65 : 0.75;
    const scale = count <= 3 ? 1.0 : 0.78;

    return { cols, rows, spaceX, spaceY, topY, scale };
  };

  // RENDERIZADO PRINCIPAL
  return (
    <div className="actividad-ra-container">
      <HeaderActividad
        titulo="Clasifica los modelos en la categoria correspondiente"
        onBack={enVistaPrevia ? () => navigate(origen, { replace: true }) : undefined}
      />

      {/* Escena de realidad aumentada */}
      <a-scene
        arjs="sourceType: webcam; facingMode: environment; debugUIEnabled: false;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true; logarithmicDepthBuffer: true"
        background="transparent: true"
      >
        {/* Zonas de clasificación */}
        {grupos.map((grupo, index) => {
          const z = -3;
          const yBox = -0.6;
          const count = grupos.length;

          const totalWidth = count <= 1 ? 0 : count === 2 ? 1.2 : 1;
          const step = count > 1 ? totalWidth / (count - 1) : 0;
          const start = -totalWidth / 2;
          const x = start + index * step;

          return (
            <a-entity key={index}>
              <a-box
                categoria={grupo}
                position={`${x} ${yBox} ${z}`}
                depth="0.3"
                height="0.3"
                width="0.3"
                color="#4CAF50"
                material="opacity: 0.5; transparent: true"
              />
              <a-text
                value={grupo}
                position={`${x} ${yBox - 0.25} ${z}`}
                align="center"
                color="#fff"
                wrap-count="14"
                width="0.5"
                scale="1 1 1"
              />
            </a-entity>
          );
        })}

        {/* Modelos 3D */}
        {(() => {
          const lista = modelos.slice(0, MAX_MODELOS);
          const { cols, spaceX, spaceY, topY, scale } = getFixedLayout(lista.length);
          const z = -3;

          return lista.map((modelo, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            const center = (cols - 1) / 2;

            const x = (col - center) * spaceX;
            const y = topY - row * spaceY;

            const selected = modelo.url === modeloActivo;
            const s = selected ? (scale * 1.05).toFixed(3) : scale;

            return (
              <a-entity
                key={index}
                position={`${x} ${y} ${z}`}
                grupo={modelo.grupo}
                data-modelo-url={modelo.url}
                seleccionable
              >
                {/* Modelo visual */}
                <a-entity
                  gltf-model={modelo.url}
                  scale={`${s} ${s} ${s}`}
                  {...(selected
                    ? {
                        'animation__pulse':
                          'property: scale; dir: alternate; loop: true; dur: 800; to: ' +
                          `${(scale * 1.18).toFixed(3)} ${(scale * 1.18).toFixed(3)} ${(scale * 1.18).toFixed(3)}`,
                      }
                    : {})}
                />
                {/* Halo de selección */}
                {selected && (
                  <a-ring
                    position="0 -0.35 0"
                    rotation="-90 0 0"
                    radius-inner="0.12"
                    radius-outer="0.18"
                    color="#63CEE0"
                    material="opacity: 0.55; transparent: true"
                    animation__halo="property: material.opacity; dir: alternate; loop: true; dur: 900; from: 0.25; to: 0.85"
                  />
                )}
              </a-entity>
            );
          });
        })()}

        <a-entity camera="fov: 95" position="0 0 0" />
      </a-scene>

      {/* Controles de selección de modelo */}
      <div className="controles-modelos">
          {modelos
            .slice(0, MAX_MODELOS) 
            .filter(m => !modelosClasificados.includes(m.url)) 
            .map((modelo, index) => (
              <button
                key={index}
                className={`btn-modelo ${modelo.url === modeloActivo ? "activo" : ""}`}
                onClick={() =>
                  setModeloActivo(m => (m === modelo.url ? null : modelo.url))
                }
              >
                {modelo.nombre}
              </button>
            ))}
        </div>

      {/* Instrucciones emergentes */}
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
            <div className="instrucciones-popup">{instrucciones}</div>
          )}
        </div>
      )}
    </div>
  );
};


export default ActividadClasificacionModelos;
