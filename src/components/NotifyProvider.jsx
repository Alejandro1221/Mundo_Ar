import React, { createContext, useContext } from "react";
import { toast } from "react-toastify";

const UiContext = createContext(null);

export function NotifyProvider({ children }) {
  const notify = ({
    message = "Hecho",
    type = "success",        // "success" | "info" | "warning" | "error" | "default"
    autoClose = 2000,
    position = "top-center",
  } = {}) => {
    toast(message, { type, autoClose, position });
  };

  const confirm = ({
    title = "¿Estás seguro?",
    message = "Esta acción no se puede deshacer.",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
    toastId,
    position = "top-center",
  } = {}) =>
    new Promise((resolve) => {
      if (toastId && toast.isActive(toastId)) return;
      toast(
        ({ closeToast }) => (
          <div className="toast-confirmation">
            <p>¿Eliminar este juego? No se puede deshacer.</p>
            <div className="toast-buttons">
              <button
                className="toast-btn-cancel"
                onClick={() => { resolve(false); closeToast(); }}
              >
                Cancelar
              </button>
              <button
                className="toast-btn-confirm"
                onClick={() => { resolve(true); closeToast(); }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ),
        { autoClose: false, closeOnClick: false, draggable: false, closeButton: true, position, toastId }
      );
    });

  return (
    <UiContext.Provider value={{ notify, confirm }}>
      {children}
    </UiContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useNotify debe usarse dentro de <NotifyProvider>");
  return ctx.notify;
}

export function useConfirm() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de <NotifyProvider>");
  return ctx.confirm;
}
