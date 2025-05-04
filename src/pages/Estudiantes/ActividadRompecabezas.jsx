import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useAR } from "../../hooks/useAR";
import "../../assets/styles/estudiante/ActividadRompecabezas.css";
import "../../aframe/touchMove"; 
import { CELEBRACIONES } from "../../utils/celebraciones";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";


const ActividadRompecabezas = () => {
  useAR();
  const navigate = useNavigate();
  const [imagenUrl, setImagenUrl] = useState(null);
  const [celebracion, setCelebracion] = useState(null);
  const [encajados, setEncajados] = useState(Array(6).fill(false));
  const mensajeRef = useRef();
  const cubosRef = useRef([]);
  const zonasRef = useRef([]);
  const cuboActivoIndex = useRef(0);
  const [imagenCargada, setImagenCargada] = useState(false);
  const [mostrarMensajeCelebracion, setMostrarMensajeCelebracion] = useState(false);


  const posicionesBase = [
    { x: -0.8, y: 0.3, z: -2 },
    { x: -0.45, y: 0.3, z: -2 },
    { x: -0.8, y: 0.0, z: -2 },
    { x: -0.45, y: 0.0, z: -2 },
    { x: -0.8, y: -0.3, z: -2 },
    { x: -0.45, y: -0.3, z: -2 },
  ];
  
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const posicionesAleatorias = useRef(shuffleArray(posicionesBase));

  useEffect(() => {
    const juegoId = sessionStorage.getItem("juegoId");
    const casillaId = sessionStorage.getItem("casillaId");

    if (!juegoId || !casillaId) {
      alert("No se encontró el juego o casilla.");
      navigate("/estudiante/dashboard");
      return;
    }

    const cargarConfiguracion = async () => {
      const docRef = doc(db, "juegos", juegoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const configuracion = docSnap.data()?.casillas?.[casillaId]?.configuracion;
        if (configuracion?.imagen) setImagenUrl(configuracion.imagen);
        if (configuracion?.celebracion) setCelebracion(configuracion.celebracion);
      }
    };

    cargarConfiguracion();
  }, [navigate]);

  useEffect(() => {
    window.encajados = encajados;
    window.zonasRef = zonasRef.current;
    window.cuboActivoIndex = cuboActivoIndex.current;
    window.mensajeRef = mensajeRef.current;
    window.celebracion = celebracion;
  }, [encajados]);

  const [, setActualizar] = useState(false);

  const cambiarCubo = () => {
    let siguiente = cuboActivoIndex.current;
    do {
      siguiente = (siguiente + 1) % 6;
    } while (encajados[siguiente] && siguiente !== cuboActivoIndex.current);
    
    cuboActivoIndex.current = siguiente;
    window.cuboActivoIndex = siguiente; 
    setEncajados([...encajados]); 
    setActualizar(a => !a);
  };

  useEffect(() => {
    if (imagenUrl) {
      const first = encajados.findIndex(v => !v);
      cuboActivoIndex.current = first !== -1 ? first : 0;
      window.cuboActivoIndex = cuboActivoIndex.current;
    }
  }, [imagenUrl]);

  const offsets = [
    '0 0.66', '0.5 0.66',
    '0 0.33', '0.5 0.33',
    '0 0',    '0.5 0'
  ];

  const shuffledOffsets = useRef(
    shuffleArray(
      [...Array(6)].map((_, i) => ({
        fichaOriginal: i,
        offset: offsets[i]
      }))
    )
  );

  useEffect(() => {
    cubosRef.current.forEach((el, i) => {
      if (el) {
        el.classList.toggle("activo", i === cuboActivoIndex.current);
      }
    });
  }, [encajados]);

  useEffect(() => {
    window.celebracion = celebracion;
  }, [celebracion]);

  useEffect(() => {
    window.marcarCuboComoEncajado = (fichaId) => {
      const nuevosEncajados = [...encajados];
      nuevosEncajados[fichaId] = true;
      setEncajados(nuevosEncajados);
  
      // Buscar el siguiente cubo disponible
      let siguiente = fichaId;
      do {
        siguiente = (siguiente + 1) % 6;
      } while (nuevosEncajados[siguiente] && siguiente !== fichaId);
  
      if (!nuevosEncajados.every(Boolean)) {
        cuboActivoIndex.current = siguiente;
        window.cuboActivoIndex = siguiente;
        setActualizar(a => !a); 
      }

      if (nuevosEncajados.every(Boolean)) {
        if (mensajeRef.current) {
          mensajeRef.current.setAttribute("visible", "true");
        }
        if (window.celebracion?.tipo && CELEBRACIONES[window.celebracion.tipo]) {
          const tipo = window.celebracion.tipo;
          const opciones = window.celebracion.opciones || {};
          CELEBRACIONES[tipo].render(opciones);

          if (tipo === "mensaje") {
            setMostrarMensajeCelebracion(true);
          }
        }
      }
    };
  }, [encajados]);

  return (
    <>
      <HeaderActividad titulo="Arma el rompecabezas" />
      <button className="boton-cambiar-cubo" onClick={cambiarCubo}>
        🔁 Cambiar cubo
      </button>
      <a-scene
        arjs="sourceType: webcam;"
        vr-mode-ui="enabled: false"
        renderer="antialias: true; alpha: true"
      >
        <a-entity camera position="0 0 1"></a-entity>

        <a-plane
          color="transparent"
          width="0.6"
          height="0.9"
          position="-0.6 0 -2"
          opacity="0"
          className="tablero tablero-izquierdo"
        ></a-plane>

        <a-plane
          color="transparent"
          width="0.1"
          height="0.1"
          className="tablero tablero-derecho"
           opacity="0"
        ></a-plane>

        <a-entity id="zonas">
          {[...Array(6)].map((_, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const pos = `${0.5 + col * 0.2} ${0.3 - row * 0.26} -2.01`;
            return (
              <a-box
                key={i}
                className="zona"
                zona-id={i}
                position={pos}
                depth="0.45"
                height="0.26"
                width="0.26"
                color="#EEE"
                opacity="0.3"
                ref={(el) => (zonasRef.current[i] = el)}
              ></a-box>
            );
          })}
        </a-entity>

        <a-text
          id="mensaje-exito"
          value="¡Rompecabezas completo!"
          visible="false"
          position="0 1.5 -2"
          align="center"
          color="lime"
          scale="1.5 1.5 1.5"
          ref={mensajeRef}
        ></a-text>

        <a-assets>
          <img
            id="imagen-rompecabezas"
            src={imagenUrl}
            crossOrigin="anonymous"
            preload="true"
            onLoad={() => setImagenCargada(true)} 
          />
        </a-assets>

        <a-entity id="cubos">
          {imagenUrl && imagenCargada &&
            (() => {
              window.cubosData = []; 

              return shuffledOffsets.current.map(({ fichaOriginal, offset }, i) => {
                const pos = posicionesAleatorias.current[i];
                const fichaId = fichaOriginal;

                // Guardar qué ficha representa cada cubo
                window.cubosData[fichaId] = { fichaOriginal };

                return (
                  <a-box
                    key={fichaId}
                    ficha-id={fichaId}
                    cubo-rompecabezas
                    className={cuboActivoIndex.current === fichaId ? "activo" : ""}
                    depth="0.25"
                    height="0.25"
                    width="0.25"
                    position={`${pos.x} ${pos.y} ${pos.z}`}
                    shadow="cast: true; receive: true"
                    material={`src: #imagen-rompecabezas; repeat: 0.5 0.33; offset: ${offset}; metalness: 0.2; roughness: 0.8; emissive: ${cuboActivoIndex.current === fichaId ? '#FFD700' : '#000000'}; emissiveIntensity: ${cuboActivoIndex.current === fichaId ? '0.4' : '0'}`}
                    touch-move
                    ref={(el) => (cubosRef.current[fichaId] = el)}
                  ></a-box>
                );
              });
            })()
          }
        </a-entity>
        
      </a-scene>
      {mostrarMensajeCelebracion && celebracion?.tipo === "mensaje" && (
        <div className="celebracion-mensaje">
          {celebracion.opciones?.mensaje || "¡Muy bien!"}
        </div>
      )}
    </>
  );
};

export default ActividadRompecabezas;
