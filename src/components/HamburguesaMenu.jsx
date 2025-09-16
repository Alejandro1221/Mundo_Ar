import React, { useEffect, useRef, useState } from "react";
import { FiMenu } from "react-icons/fi";

export default function HamburguesaMenu({
  options = [],               
  placement = "bottom-start",  
  anchor = "side-right",       
  offset = 8,                  
  buttonAriaLabel = "Abrir menú",
  buttonClassName = "",
  children,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  // Cerrar con clic afuera / Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <div className="hamburguesa-menu-container" ref={rootRef}>
      <button
        className={`hamburguesa-btn ${buttonClassName}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={buttonAriaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        {children ?? <FiMenu />}
      </button>

      {open && (
        <div

          className={`hamburguesa-menu ${placement}${anchor ? ` ${anchor}` : ""}`}
          role="menu"
          style={{ "--hm-offset": `${offset}px` }}
        >
          <div className="hamburguesa-menu__head">
            <button
              className="hamburguesa-menu__close"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              type="button"
            >
              ❌
            </button>
          </div>

          <ul className="hamburguesa-menu__list">
            {options.map((opt, idx) => (
              <li key={idx}>
                <button
                  type="button"
                  className={`hamburguesa-menu-item ${opt.danger ? "danger" : ""}`}
                  onClick={() => { setOpen(false); opt.onClick?.(); }}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

      )}
    </div>
  );
}
