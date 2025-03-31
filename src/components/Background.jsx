import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const Background = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: {
          color: "transparent",
        },
        particles: {
          number: {
            value: 20, 
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: ["#90BFC3", "#DDE5CD", "#F3D9D5"], 
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.3, 
          },
          size: {
            value: { min: 8, max: 12 }, 
          },
          move: {
            enable: true,
            speed: 0.3, 
            direction: "none",
            outMode: "bounce",
          },
        },
      }}
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
};

export default Background;
