import React, { useEffect, useState } from "react";
import { obtenerSonidos } from "../../services/sonidoService";
import "../../assets/styles/bancoSonidos/bancoSonidosSeleccion.css";
import FormularioSubidaSonidos from "./FormularioSubidaSonidos";
import SonidoItem from "../../components/SonidoItem";


const BancoSonidosSeleccion = ({ onSeleccionar }) => {
  const [sonidos, setSonidos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const cargarSonidos = async () => {
      const listaSonidos = await obtenerSonidos();
      setSonidos(listaSonidos);
    };
    cargarSonidos();
  }, []);

return (
    <div className="banco-sonidos-seleccion">
      <div className="toolbar-seleccion">
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          Agregar sonido
        </button>
      </div>
      <div className="lista-sonidos-seleccion">
      {sonidos.length > 0 ? (
      sonidos.map((sonido) => (
        <SonidoItem
          key={sonido.id}
          sonido={sonido}
          setSonidos={setSonidos}
          modoSeleccion
          onSeleccionar={(s) => {
            const modeloSeleccionado = JSON.parse(sessionStorage.getItem("modeloSeleccionadoParaSonido"));
            if (!modeloSeleccionado) {
              alert("Error: No se ha seleccionado un modelo.");
              return;
            }
            // asignar sonido al modelo y persistir en sessionStorage
            modeloSeleccionado.sonido = { id: s.id, nombre: s.nombre, url: s.url };

            let modelosSeleccionados = JSON.parse(sessionStorage.getItem("modelosSeleccionados")) || [];
            modelosSeleccionados = modelosSeleccionados.map(m =>
              m.url === modeloSeleccionado.url ? modeloSeleccionado : m
            );

            sessionStorage.setItem("modelosSeleccionados", JSON.stringify(modelosSeleccionados));
            sessionStorage.setItem("sonidoSeleccionado", JSON.stringify(modeloSeleccionado.sonido));
            window.history.back();
          }}
        />
      ))
    ) : (
      <p>No hay sonidos disponibles.</p>
    )}
    </div>
      {showModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
          <div className="modal-window" role="dialog" aria-modal="true">
            <div className="modal-header">
              <h2>Subir sonido</h2>
              <button className="menu-close" onClick={() => setShowModal(false)}>❌</button>
            </div>
            <div className="modal-body">
              <FormularioSubidaSonidos
                onSuccess={() => setShowModal(false)}
                onUploaded={(nuevo) => {
                  const cat = typeof nuevo.categoria === "string" ? nuevo.categoria : (nuevo.categoria?.nombre || "");
                  setSonidos(prev => [{ ...nuevo, categoria: cat }, ...prev]);
                  setShowModal(false);
                }}
                onNuevaCategoria={() => {}}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BancoSonidosSeleccion;
