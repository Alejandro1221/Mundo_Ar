import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const Background = () => {
  const particlesInit = useCallback(async (engine) => {
    console.log("Inicializando partículas...");
    await loadFull(engine); // Carga completa de tsparticles
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false }, // 🔹 Evita que ocupe todo el viewport
        background: {
          color: "transparent", // 🔹 Deja el fondo transparente para ver el gradiente
        },
        particles: {
          number: { value: 50 },
          shape: { type: "circle" },
          opacity: { value: 0.7 },
          size: { value: 6 },
          move: { enable: true, speed: 1 },
        },
      }}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -1, // 🔹 Envía las partículas al fondo
      }}
    />
  );
};

export default Background;
