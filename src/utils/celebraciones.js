import confetti from "canvas-confetti";

export const CELEBRACIONES = {
  mensaje: {
    label: "Mensaje en pantalla",
    render: (opciones) => {
      const div = document.createElement("div");
      div.innerText = opciones?.mensaje || "¡Buen trabajo!";
      div.style.position = "fixed";
      div.style.top = "50%";
      div.style.left = "50%";
      div.style.transform = "translate(-50%, -50%)";
      div.style.padding = "20px 40px";
      div.style.backgroundColor = "#4CAF50";
      div.style.color = "#fff";
      div.style.fontSize = "24px";
      div.style.borderRadius = "12px";
      div.style.zIndex = "9999";
      div.style.boxShadow = "0 0 20px rgba(0,0,0,0.3)";
      document.body.appendChild(div);
  
      setTimeout(() => div.remove(), 3000);
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
      //gif.src = opciones?.url || "/default-celebration.gif";
      gif.src = opciones?.gifUrl || "/default-celebration.gif";
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


