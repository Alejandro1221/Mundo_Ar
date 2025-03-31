// components/ModeloInteractivo.jsx
import React from "react";
import { Entity, Scene } from "aframe-react";

const ModeloInteractivo = ({ modelo, seleccionado, onSeleccionar }) => {
  const esSeleccionado = seleccionado?.url === modelo.url;

  return (
    <div
      className={`estudiante-modelo-item ${esSeleccionado ? "seleccionado" : ""}`}
      onClick={() => onSeleccionar(modelo)}
    >
      <Scene embedded shadow="type: soft" vr-mode-ui="enabled: false" style={{ width: "200px", height: "200px" }}>
        <Entity light="type: directional; intensity: 0.7" position="1 3 1" castShadow />
        
        <Entity
          gltf-model={modelo.url}
          position="0 1 -2"
          scale="1.2 1.2 1.2"
          rotation="0 45 0"
          shadow="cast: true"
          animation="property: rotation; to: 0 405 0; loop: true; dur: 8000"
        />

        <Entity 
          geometry="primitive: plane; width: 2; height: 2"
          material="color: #ddd; opacity: 0.6"
          position="0 -0.01 -2"
          rotation="-90 0 0"
          shadow="receive: true"
        />
      </Scene>

      <p>{modelo.nombre}</p>
    </div>
  );
};

export default ModeloInteractivo;
