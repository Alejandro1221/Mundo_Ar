import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConfig";
import { useAR } from "../../hooks/useAR";
import "../../assets/styles/estudiante/ActividadRompecabezas.css";
import "../../aframe/touchMove"; 
import { CELEBRACIONES } from "../../utils/celebraciones";
import HeaderActividad from "../../components/Estudiante/HeaderActividad";

const ActividadRompecabezas = ({ vistaPrevia = false }) => { 
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
  const [completado, setCompletado] = useState(false);
  const [grid, setGrid] = useState({ cols: 2, rows: 3 });
  const isLandscape = grid.cols > grid.rows;

  const EPS = 0.0005;                                    
  const repeatX = 1 / grid.cols + EPS;
  const repeatY = 1 / grid.rows + EPS;
  
  // Medidas base
  const CUBE = 0.25;          
  const GAP  = 0.01;           
  const stepX = CUBE + GAP;
  const stepY = CUBE + GAP;

  const CENTER_ZONAS  = isLandscape
  ? { x:  0.00, y:  0.50, z: -2.06 }  // HORIZONTAL: zonas ARRIBA
  : { x:  0.45, y:  0.10, z: -2.06 }  // VERTICAL:  zonas A LA DERECHA

const CENTER_CUBOS  = isLandscape
  ? { x:  0.00, y: -0.25, z: -2.00 }  // HORIZONTAL: cubos ABAJO
  : { x: -0.45, y:  0.10, z: -2.00 }  // VERTICAL:  cubos A LA IZQUIERDA
  
  const zonasPos = (i) => {
    const col = i % grid.cols;
    const row = Math.floor(i / grid.cols);
    const x = CENTER_ZONAS.x + (col - (grid.cols - 1) / 2) * CUBE; 
    const y = CENTER_ZONAS.y - (row - (grid.rows - 1) / 2) * CUBE; 
    return `${x.toFixed(3)} ${y.toFixed(3)} ${CENTER_ZONAS.z}`;
  };

  // Base ordenada de cubos sueltos (abajo), que luego barajamos
  const buildBaseSueltos = () =>
    Array.from({ length: grid.cols * grid.rows }, (_, i) => {
      const col = i % grid.cols;
      const row = Math.floor(i / grid.cols);
      return {
        x: CENTER_CUBOS.x + (col - (grid.cols - 1) / 2) * (stepX * 1.15),
        y: CENTER_CUBOS.y - (row - (grid.rows - 1) / 2) * (stepY * 1.15),
        z: CENTER_CUBOS.z
      };
    });

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Posiciones barajadas de cubos sueltos (se recalculan al cambiar orientación)
  const posicionesAleatorias = useRef([]);
  useEffect(() => {
    const base = buildBaseSueltos();
    posicionesAleatorias.current = shuffleArray(base);
  }, [grid.cols, grid.rows]);

  
  useEffect(() => {
    if (vistaPrevia) {
      const imagen = sessionStorage.getItem("imagenRompecabezas");
      const celebracionGuardada = JSON.parse(sessionStorage.getItem("celebracionSeleccionada") || "{}");
      const gridGuardado = JSON.parse(sessionStorage.getItem("gridRompecabezas") || "null");
  
      if (imagen) setImagenUrl(imagen);
      setCelebracion(celebracionGuardada);
      if (gridGuardado) setGrid(gridGuardado);
  
      return; 
    }
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
        if (configuracion?.grid) setGrid(configuracion.grid);
      }
    };

    cargarConfiguracion();
  }, [vistaPrevia,navigate]);

  useEffect(() => {
    window.encajados = encajados;
    window.zonasRef = zonasRef.current;
    window.cuboActivoIndex = cuboActivoIndex.current;
    window.mensajeRef = mensajeRef.current;
    window.celebracion = celebracion;
  }, [encajados]);

  const [, setActualizar] = useState(false);

  const cambiarCubo = () => {
     if (completado) return;
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

  const calcOffsets = (cols, rows) =>
    Array.from({ length: cols * rows }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const ox = col / cols;
      const oy = (rows - 1 - row) / rows; 
      return `${ox.toFixed(4)} ${oy.toFixed(4)}`;
    });

  const shuffledOffsets = useRef([]);
  useEffect(() => {
    const dyn = calcOffsets(grid.cols, grid.rows).map((off, i) => ({
      fichaOriginal: i,
      offset: off
    }));
    shuffledOffsets.current = shuffleArray(dyn); 
  }, [grid.cols, grid.rows]);


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
        setCompletado(true);

        cuboActivoIndex.current = -1;
        window.cuboActivoIndex = -1;

        zonasRef.current.forEach(z => z && z.setAttribute('visible', false));

        if (mensajeRef.current) {
          mensajeRef.current.setAttribute("visible", "true");
        }
        if (window.celebracion?.tipo && CELEBRACIONES[window.celebracion.tipo]) {
          const tipo = window.celebracion.tipo;
          const opciones = window.celebracion.opciones || {};
          CELEBRACIONES[tipo].render(opciones);
          if (tipo === "mensaje") setMostrarMensajeCelebracion(true);
        }

        setActualizar(a => !a);
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
          {Array.from({ length: grid.cols * grid.rows }).map((_, i) => (
            <a-box
              key={i}
              className="zona"
              zona-id={i}
              position={zonasPos(i)}
              width="0.27"
              height="0.27"
              depth="0.25"
              material="
                color: #4f6c77ff;
                opacity: 0.15;
                transparent: true;
                blending: AdditiveBlending; 
                depthTest: false;
                depthWrite: false;
                side: double;
                "
              ref={(el) => (zonasRef.current[i] = el)}
            />
          ))}
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
            onLoad={(e) => {
              if (!grid || !grid.cols || !grid.rows) {
                const img = e.target;
                const isLandscape = img.naturalWidth >= img.naturalHeight;
                setGrid(isLandscape ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 });
              }
              setImagenCargada(true);
            }}
          />
        </a-assets>

        <a-entity id="cubos">
          {imagenUrl && imagenCargada &&
            (() => {
              window.cubosData = [];

              return Array.from({ length: grid.cols * grid.rows }).map((_, i) => {
                const pos = posicionesAleatorias.current[i] || { x: 0, y: 0, z: -2 };
                const { offset, fichaOriginal } =
                  shuffledOffsets.current[i] || { offset: "0 0", fichaOriginal: i };

                const fichaId = fichaOriginal;

                const isActive = !completado && cuboActivoIndex.current === fichaId;

                const z = (pos.z ?? -2.00);

                window.cubosData[fichaId] = { fichaOriginal, offset };

                return (
                  <a-box
                    key={fichaId}
                    ficha-id={fichaId}
                    cubo-rompecabezas
                    className={isActive ? "activo" : ""}
                    depth="0.25"
                    height="0.25"
                    width="0.25"
                    position={`${pos.x.toFixed(3)} ${pos.y.toFixed(3)} ${z.toFixed(3)}`}
                    shadow="cast: true; receive: true"
                    material={`shader: standard; 
                      src: #imagen-rompecabezas;
                      repeat: ${repeatX.toFixed(4)} ${repeatY.toFixed(4)};
                      offset: ${offset};
                      color: #FFFFFF;              
                      metalness: 0;                 
                      transparent: false;
                      opacity: 1;
                      emissive: ${cuboActivoIndex.current === fichaId ? '#FFD700' : '#000000'};
                      emissiveIntensity: ${cuboActivoIndex.current === fichaId ? '0.25' : '0'};
                      side: double;
                    `}

                    touch-move
                    ref={(el) => (cubosRef.current[fichaId] = el)}
                  />
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
