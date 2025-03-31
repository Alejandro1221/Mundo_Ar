import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { Entity, Scene } from "aframe-react";
import "../../assets/styles/estudiante/actividadClasificacionModelos.css";

const ActividadClasificacionModelos = () => {
  const casillaId = sessionStorage.getItem("casillaId");
  const navigate = useNavigate();
  const juegoId = sessionStorage.getItem("juegoId");

  const [modelos, setModelos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!juegoId || !casillaId) {
      alert("Juego o casilla no encontrada");
      return navigate("/estudiante/dashboard");
    }

    console.log("🧠 juegoId:", juegoId);
    console.log("🧠 casillaId:", casillaId);

    const cargarDatos = async () => {
      try {
        const juegoRef = doc(db, "juegos", juegoId);
        const juegoSnap = await getDoc(juegoRef);

        if (juegoSnap.exists()) {
          const casilla = juegoSnap.data().casillas[casillaId];

          console.log("📦 Casilla obtenida:", casilla);

          if (casilla?.configuracion) {
            const { modelos, grupos } = casilla.configuracion;
            setModelos(modelos || []);
            setGrupos(grupos || []);
          } else {
            console.warn("⚠️ Casilla sin configuración");
            setMensaje("⚠️ Esta casilla no tiene modelos configurados.");
          }
        }
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
        setMensaje("❌ Error al cargar la actividad.");
      }
    };

    cargarDatos();
  }, [casillaId, juegoId, navigate]);

  useEffect(() => {
    console.log("🧩 Modelos cargados:", modelos);
    console.log("🧩 Grupos cargados:", grupos);
  }, [modelos, grupos]);

  return (
    <div className="actividad-3d-container">
      <h2>Actividad: Clasificación de Modelos</h2>
  
      <Scene embedded vr-mode-ui="enabled: false">
        {/* Luces y cámara */}
        <Entity light="type: ambient; intensity: 0.8" />
        <Entity light="type: directional; intensity: 0.5" position="1 3 2" />
        <Entity camera look-controls position="0 2 6" />
  
        {/* Mano simulada con mouse */}
        <Entity
          id="mano"
          cursor="rayOrigin: mouse"
          raycaster="objects: .draggable"
          super-hands="{}"
        />
  
        {/* Zonas dinámicas según los grupos */}
        {grupos.map((grupo, i) => (
          <Entity
            key={grupo}
            id={`zona-${grupo}`}
            class="zona-grupo"
            geometry="primitive: plane; width: 3; height: 3"
            material={`color: ${i % 2 === 0 ? '#AED581' : '#81D4FA'}; opacity: 0.7`}
            rotation="-90 0 0"
            position={{ x: -4 + i * 4, y: 0.01, z: -4 }}
            drop-target
            static-body="shape: box"
            events={{
              'drag-drop': (e) => {
                const modeloId = e.detail?.dragged?.id;
                const zonaId = `zona-${grupo}`;
                console.log(`🔄 Soltaste ${modeloId} en ${zonaId}`);
  
                const modelo = modelos.find(m => m.nombre === modeloId);
                if (modelo?.grupo === grupo) {
                  setMensaje(`✅ ¡Correcto! ${modelo.nombre} está en el grupo ${grupo}`);
                } else {
                  setMensaje(`❌ ${modelo?.nombre || "Modelo"} no pertenece al grupo ${grupo}`);
                }
              }
            }}
          >
            <Entity
              text={{ value: grupo, align: "center", color: "#000" }}
              position={{ x: 0, y: 0.1, z: 1.5 }}
            />
          </Entity>
        ))}
  
        {/* Modelos arrastrables */}
        {modelos.length > 0 ? (
          modelos.map((modelo, i) =>
            modelo.url ? (
              <Entity
                key={i}
                id={modelo.nombre}
                class="draggable"
                gltf-model={modelo.url}
                position={{ x: -3 + i * 2.5, y: 1, z: -2 }}
                scale="1 1 1"
                animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
                draggable
                grabbable
                events={{
                  "model-loaded": function (e) {
                    e.target.setAttribute("dynamic-body", "shape: box");
                  }
                }}
              />
            ) : null
          )
        ) : (
          <Entity
            text={{ value: "⚠️ No hay modelos para mostrar", color: "red" }}
            position="0 2 0"
          />
        )}
  
        {/* Plano base */}
        <Entity
          geometry="primitive: plane; width: 20; height: 20"
          material="color: #ccc"
          rotation="-90 0 0"
          position="0 0 0"
        />
      </Scene>
  
      {/* Mensaje visual */}
      {mensaje && <p className="mensaje-feedback">{mensaje}</p>}
  
      <button
        className="estudiante-volver-btn"
        onClick={() => navigate("/estudiante/seleccionar-casilla")}
      >
        Volver
      </button>
    </div>
  );
  
};

export default ActividadClasificacionModelos;
