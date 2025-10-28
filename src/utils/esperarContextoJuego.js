export const esperarContextoJuego = (callback, intentos = 5, delay = 150) => {
  let count = 0;

  const intentar = () => {
    const juegoId = sessionStorage.getItem("juegoId");
    const casillaId = sessionStorage.getItem("casillaId");

    if (juegoId && casillaId) {
      callback(juegoId, casillaId);
      return;
    }

    count++;
    if (count < intentos) {
      setTimeout(intentar, delay);
    } else {
      // Si después de varios intentos no hay datos, redirige al dashboard
      callback(null, null);
    }
  };

  intentar();
};