{modelos.map((modelo, i) => {
  const textoSeguro = modelo.texto?.trim();
  if (!textoSeguro) return null;

  const posX = -0.2 + i * 0.5;

  return (
    <a-entity
      key={`texto-${i}`}
      position={`${posX} 0.4 -2`}
      arrastrable-texto={`index: ${i}`}
    >
      {/* Fondo tipo tarjeta */}
      <a-plane
        width="0.8"
        height="0.25"
        color="#ffffff"
        opacity="0.95"
        material="shader: flat"
        position="0 0 0"
      ></a-plane>

      {/* Texto encima */}
      <a-text
        value={textoSeguro}
        align="center"
        color="#0000cc"
        width="1.6"
        position="0 0 0.01"
        texto-meta={textoSeguro}
      ></a-text>
    </a-entity>
  );
})}
