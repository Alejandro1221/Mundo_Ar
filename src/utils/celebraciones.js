import confetti from "canvas-confetti";

export const CELEBRACIONES = {
  mensaje: {
    label: "Mensaje en pantalla",
    render: (opciones) => {
    }
  },
  confeti: {
    label: "Confeti",
    render: () => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  },
  gif: {
    label: "GIF animado",
    render: (opciones) => {
      const gif = document.createElement("img");
      gif.src = opciones?.url || "/default-celebration.gif";
      gif.className = "gif-celebracion";
      gif.style.position = "fixed";
      gif.style.top = "50%";
      gif.style.left = "50%";
      gif.style.transform = "translate(-50%, -50%)";
      gif.style.zIndex = "9999";
      gif.style.width = "200px";
      document.body.appendChild(gif);
      setTimeout(() => gif.remove(), 3000);
    }
  }
};


