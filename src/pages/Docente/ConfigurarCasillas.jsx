import React, { useEffect,useState } from "react";
import { useParams, useNavigate,useLocation } from "react-router-dom";
import { useCasillas } from "../../hooks/useCasillas";
import { db } from "../../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { eliminarJuegoPorId, actualizarJuego } from "../../services/juegosService";
import { useNotify, useConfirm } from "../../components/NotifyProvider";
import MenuHambuguesa from "../../components/MenuHamburguesa";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/styles/docente/configurarCasillas.css";


const ConfigurarCasillas = () => {
  const { juegoId } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();

  const [nombreJuego, setNombreJuego] = useState("");
  const [publico, setPublico] = useState(false);
  const [loadingJuego, setLoadingJuego] = useState(true);
  const [savingJuego, setSavingJuego] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [backupNombre, setBackupNombre] = useState("");
  const [backupPublico, setBackupPublico] = useState(false);
  const notify = useNotify();
  const confirm = useConfirm();

  const {
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
  } = useCasillas(juegoId);

  const slugRuta = {
  "modelo-sonido": "plantilla-sonido-modelo",
  "clasificacion-modelos": "clasificacion-modelos",
  "rompecabezas-modelo": "rompecabezas-modelo",
  "modelo-texto": "modelo-texto",
  "casilla-sorpresa": "casilla-sorpresa",
};

  const rutaPlantilla = (plantilla, juegoId) =>
    `/docente/configurar-casillas/${juegoId}/${slugRuta[plantilla] || plantilla}`;
  

useEffect(() => {
  if (!juegoId) {
    if (window.location.pathname !== "/docente/dashboard") {
      navigate("/docente/dashboard", { replace: true });
    }
    return;
  }

  const cargarJuego = async () => {
    try {
      setLoadingJuego(true);
      const ref = doc(db, "juegos", juegoId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setNombreJuego(data?.nombre || "");
        setPublico(Boolean(data?.publico));
        setBackupNombre(data?.nombre || "");
        setBackupPublico(Boolean(data?.publico));
      }
    } catch (e) {
      notify({ message: "No se pudo cargar el juego", type: "error" });
    } finally {
      setLoadingJuego(false);
    }
};

  cargarJuego();
  cargarCasillas();
}, [juegoId, cargarCasillas, navigate]);
  
const startEdit = () => {
  setBackupNombre(nombreJuego);
  setBackupPublico(publico);
  setEditMode(true);
};

const cancelEdit = () => {
  setNombreJuego(backupNombre);
  setPublico(backupPublico);
  setEditMode(false);
};

const guardarDetallesJuego = async () => {
  try {
    if (!nombreJuego.trim()) {
      notify({ message: "Escribe un nombre para el juego", type: "warning" });
      return;
    }
    setSavingJuego(true);
    await actualizarJuego(juegoId, { nombre: nombreJuego.trim(), publico });
    notify({ message: "Juego actualizado", type: "success" });
    setEditMode(false);
  } catch (e) {
    console.error(e);
    notify({ message: "No se pudo actualizar el juego", type: "error" });
  } finally {
    setSavingJuego(false);
  }
};

const eliminarJuego = async () => {
  const ok = await confirm({
    title: "Eliminar juego",
    message: "¿Seguro que deseas eliminar este juego? No se puede deshacer.",
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    variant: "danger",
    toastId: `confirm-delete-${juegoId}`
  });
  if (!ok) return;

  try {
    await eliminarJuegoPorId(juegoId);
    notify({ message: "Juego eliminado", type: "success" });
    navigate("/docente/dashboard", { replace: true });
  } catch (e) {
    console.error(e);
    notify({
      message: e?.code
        ? `No se pudo eliminar: ${e.code}`
        : "No se pudo eliminar el juego",
      type: "error"
    });
  }
};

  return (
    <div className="configurar-casillas-container">
      <div>
          <MenuHambuguesa />
      </div>
      <section className={`juego-panel ${editMode ? "is-editing" : ""}`}>
        <div className="juego-panel__bar">
          <h2 className="juego-panel__titulo">Información del juego</h2>

          <div className="juego-panel__toolbar">
            {!editMode ? (
              <>
                <button className="btn btn--secondary" onClick={startEdit}>Editar Juego</button>
                <button className="btn btn--danger" onClick={eliminarJuego}>Eliminar juego</button>
              </>
            ) : (
              <>
                <button className="btn btn--primary" onClick={cancelEdit}>Cancelar</button>
                <button
                  className="btn btn--success"
                  onClick={guardarDetallesJuego}
                  disabled={savingJuego || !nombreJuego.trim()}
                >
                  {savingJuego ? "Guardando..." : "Guardar"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="juego-panel__fila">
          <label className="juego-panel__label" htmlFor="nombreJuego">Nombre</label>
          <input
            id="nombreJuego"
            type="text"
            className="juego-panel__input"
            value={nombreJuego}
            onChange={(e) => setNombreJuego(e.target.value)}
            disabled={!editMode || loadingJuego || savingJuego}
            placeholder="Nombre del juego"
          />
        </div>

        <div className="juego-panel__fila">
          <span className="juego-panel__label">Visibilidad</span>

          <div className="switch-container">
            <label className="switch-label" htmlFor="visibilidadSwitch">
              <span>{publico ? "Juego Público" : "Juego Privado"}</span>
              <span className="switch">
                <input
                  id="visibilidadSwitch"
                  type="checkbox"
                  role="switch"
                  aria-checked={publico}
                  checked={publico}
                  onChange={(e) => setPublico(e.target.checked)}
                  disabled={!editMode || loadingJuego || savingJuego}
                />
                <span className="slider" />
              </span>
            </label>
          </div>
        </div>
      </section>
  
      <div className="encabezado-horizontal">
        <h2 className="configurar-casillas-container__titulo">
           Casillas del Juego
        </h2>
      </div>
      {/* Tablero de casillas */}
      <div className="configurar-casillas-container__tablero">
        {casillas.map((casilla, index) => (
          <div
            key={index}
            className={`configurar-casillas-container__casilla ${casilla.plantilla ? `configurada plantilla-${casilla.plantilla}` : ""}`}
            onClick={() => abrirModal(index, casilla.plantilla)}
          >
            <span>{index + 1}</span>
            {casilla.plantilla && (
              <span className="configurar-casillas-container__plantilla">{casilla.plantilla}</span>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="configurar-casillas-container__modal">
          <div className="configurar-casillas-container__modal-content">
            {casillas[casillaSeleccionada]?.plantilla ? (
              <>
                <h3>Plantilla asignada:</h3>
                <p><strong>{casillas[casillaSeleccionada]?.plantilla}</strong></p>
                <div className="configurar-casillas-container__modal-buttons">
                  <button
                  className="btn--secondary"
                    onClick={() => {
                      setModalVisible(false);
                      const plantilla = casillas[casillaSeleccionada]?.plantilla;
                      if (!plantilla) return;
                      
                      sessionStorage.setItem("paginaAnterior", window.location.pathname);
                      sessionStorage.setItem("juegoId", juegoId);
                      sessionStorage.setItem("casillaId", casillaSeleccionada);
                      
                      const ruta = rutaPlantilla(plantilla, juegoId);
                      navigate(ruta, { state: { from: location.pathname } });
                    }}
                  >
                    Editar Plantilla
                  </button>

                  <button
                  className="eliminar-btn"
                    onClick={async () => {
                    const ok = await confirm({
                      title: "Eliminar plantilla",
                      message: "¿Seguro que deseas eliminar esta plantilla?",
                      confirmText: "Eliminar",
                      cancelText: "Cancelar",
                      variant: "danger",
                      toastId: `confirm-delete-plantilla-${casillaSeleccionada}`,
                    });
                    if (!ok) return;

                    await eliminarPlantilla(juegoId, casillaSeleccionada);
                    notify({ message: "Plantilla eliminada", type: "success" });
                    setModalVisible(false);
                    cargarCasillas();
                  }}
                  >
                    Eliminar Plantilla
                  </button>

                  <button className="btn--primary" onClick={() => setModalVisible(false)}>Cancelar</button>
                </div>
              </>
            ) : (
              <>
                <h3>Seleccionar Plantilla</h3>
                <select
                  value={plantillaSeleccionada}
                  onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                >
                  <option value="">Seleccione una plantilla</option>
                  <option value="modelo-sonido">Modelo-Sonido</option>
                  <option value="clasificacion-modelos">Clasificar Modelos</option>
                  <option value="rompecabezas-modelo">Rompecabezas Modelo</option>
                  <option value="modelo-texto">Modelo texto</option>
                  <option value="casilla-sorpresa">Casilla Sorpresa</option>
                </select>
                <div className="configurar-casillas-container__modal-buttons">
                  <button className="cancelar-btn"  onClick={() => setModalVisible(false)}>Cancelar</button>
                  <button
                    type="button"
                    className="guardar-btn"
                    disabled={!plantillaSeleccionada}
                    onClick={async () => {
                      // Limpiezas que ya haces
                      sessionStorage.removeItem("modelosSeleccionados");
                      sessionStorage.removeItem("sonidoSeleccionado");
                      sessionStorage.removeItem("modeloAsociadoParaSonido");
                      sessionStorage.removeItem(`modelosSeleccionados_${juegoId}_${casillaSeleccionada}`);
                      sessionStorage.removeItem("gruposSeleccionados");
                      sessionStorage.removeItem("asignacionesModelos");
                      sessionStorage.removeItem("celebracionSeleccionada");

                      // Guarda primero
                      await guardarCambios();

                      // Guarda contexto (igual que editar)
                      sessionStorage.setItem("paginaAnterior", window.location.pathname);
                      sessionStorage.setItem("juegoId", juegoId);
                      sessionStorage.setItem("casillaId", casillaSeleccionada);

                      // Ir a la plantilla creada
                      const ruta = rutaPlantilla(plantillaSeleccionada, juegoId);
                      navigate(ruta, { state: { from: location.pathname } });
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <ToastContainer position="top-center" autoClose={1200} />
    </div>
  );
};

export default ConfigurarCasillas;
