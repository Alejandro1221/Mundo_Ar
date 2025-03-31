export const CELEBRACIONES = {
    mensaje: {
      label: "Mensaje en pantalla",
      render: (opciones) => opciones?.mensaje || "¡Buen trabajo!",
    },
    confeti: {
      label: "Confeti",
      render: () => {
        // Aquí podrías invocar un componente de confeti o animación
        const confetti = document.createElement("div");
        confetti.innerText = "🎉🎉🎉";
        confetti.className = "confeti-estilo"; 
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      },
    },
    gif: {
      label: "GIF animado",
      render: (opciones) => {
        const gif = document.createElement("img");
        gif.src = opciones?.url || "/default-celebration.gif";
        gif.className = "gif-celebracion";
        document.body.appendChild(gif);
        setTimeout(() => gif.remove(), 3000);
      },
    }
  };
  