import React, { useState, useEffect } from "react";

const LS_KEY = "accessible-widget-settings-v2";

function saveSettings(settings) {
  localStorage.setItem(LS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  try {
    const s = localStorage.getItem(LS_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

const styles = {
  floatingButton: {
    position: "fixed",
    bottom: 20,
    left: 20,
    width: 45,
    height: 45,
    borderRadius: "50%",
    backgroundColor: "#0078d4",
    color: "white",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    cursor: "pointer",
    zIndex: 10000,
    fontSize: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  widget: {
    position: "fixed",
    bottom: 90,
    left: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    zIndex: 10000,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    userSelect: "none",
    width: 300,
    maxHeight: "70vh",
    overflowY: "auto",
  },
  header: {
    backgroundColor: "#0078d4",
    color: "white",
    padding: "12px 16px",
    borderRadius: "12px 12px 0 0",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "white",
    fontSize: 20,
    cursor: "pointer",
  },
  menu: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    fontSize: 14,
    color: "#333",
  },
  label: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "500",
  },
  checkbox: {
    transform: "scale(1.4)",
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #0078d4",
    backgroundColor: "#e1f0ff",
    color: "#0078d4",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: 16,
  },
  section: {
    borderBottom: "1px solid #eee",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0078d4",
  },
};

export default function AccessibilityWidgetFixed() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [largeCursor, setLargeCursor] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [easyReadMode, setEasyReadMode] = useState(false);
  const [highlightFocus, setHighlightFocus] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const settings = loadSettings();
    if (settings) {
      setFontSize(settings.fontSize || 100);
      setHighContrast(settings.highContrast || false);
      setUnderlineLinks(settings.underlineLinks || false);
      setLargeCursor(settings.largeCursor || false);
      setDyslexiaFont(settings.dyslexiaFont || false);
      setEasyReadMode(settings.easyReadMode || false);
      setHighlightFocus(settings.highlightFocus || false);
      setReduceMotion(settings.reduceMotion || false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--accessible-font-size", fontSize + "%");
    document.body.style.fontSize = fontSize + "%";

    if (highContrast) {
      document.documentElement.classList.add("aw-high-contrast");
    } else {
      document.documentElement.classList.remove("aw-high-contrast");
    }

    if (largeCursor) {
      document.documentElement.classList.add("aw-large-cursor");
    } else {
      document.documentElement.classList.remove("aw-large-cursor");
    }

    if (underlineLinks) {
      document.documentElement.classList.add("aw-underline-links");
    } else {
      document.documentElement.classList.remove("aw-underline-links");
    }

    if (dyslexiaFont) {
      document.documentElement.classList.add("aw-dyslexia-font");
    } else {
      document.documentElement.classList.remove("aw-dyslexia-font");
    }

    if (easyReadMode) {
      document.documentElement.classList.add("aw-easy-read");
    } else {
      document.documentElement.classList.remove("aw-easy-read");
    }

    if (highlightFocus) {
      document.documentElement.classList.add("aw-highlight-focus");
    } else {
      document.documentElement.classList.remove("aw-highlight-focus");
    }

    if (reduceMotion) {
      document.documentElement.classList.add("aw-reduce-motion");
    } else {
      document.documentElement.classList.remove("aw-reduce-motion");
    }

    saveSettings({
      fontSize, highContrast, underlineLinks, largeCursor, 
      dyslexiaFont, easyReadMode, highlightFocus, reduceMotion
    });
  }, [fontSize, highContrast, underlineLinks, largeCursor, dyslexiaFont, easyReadMode, highlightFocus, reduceMotion]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={styles.floatingButton}
        aria-label="Abrir panel de accesibilidad"
        title="Accesibilidad"
        >
        <img 
            src="https://careers.victor.org/wp-content/uploads/2022/12/accessibility-gray.png" 
            alt="Accesibilidad" 
            style={{ width: '35px', height: '35px' }} 
        />
        </button>

      {open && (
        <div style={styles.widget} role="dialog" aria-labelledby="aw-title">
          <div style={styles.header}>
            <span id="aw-title">Opciones de Accesibilidad</span>
            <button 
              onClick={() => setOpen(false)} 
              style={styles.closeButton}
              aria-label="Cerrar panel"
            >
              ×
            </button>
          </div>
          
          <div style={styles.menu}>
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Tamaño de Texto</div>
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                {fontSize}%
              </div>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => setFontSize(v => Math.max(v - 10, 50))}
                  style={styles.button}
                  aria-label="Disminuir tamaño de texto"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(100)}
                  style={styles.button}
                  aria-label="Tamaño normal"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize(v => Math.min(v + 10, 200))}
                  style={styles.button}
                  aria-label="Aumentar tamaño de texto"
                >
                  A+
                </button>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Visual</div>
              
              <label style={styles.label}>
                <span>Contraste alto</span>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={() => setHighContrast(!highContrast)}
                  style={styles.checkbox}
                />
              </label>

              <label style={styles.label}>
                <span>Cursor grande</span>
                <input
                  type="checkbox"
                  checked={largeCursor}
                  onChange={() => setLargeCursor(!largeCursor)}
                  style={styles.checkbox}
                />
              </label>

              <label style={styles.label}>
                <span>Subrayar enlaces</span>
                <input
                  type="checkbox"
                  checked={underlineLinks}
                  onChange={() => setUnderlineLinks(!underlineLinks)}
                  style={styles.checkbox}
                />
              </label>

              <label style={styles.label}>
                <span>Resaltar foco</span>
                <input
                  type="checkbox"
                  checked={highlightFocus}
                  onChange={() => setHighlightFocus(!highlightFocus)}
                  style={styles.checkbox}
                />
              </label>

              <label style={styles.label}>
                <span>Reducir animaciones</span>
                <input
                  type="checkbox"
                  checked={reduceMotion}
                  onChange={() => setReduceMotion(!reduceMotion)}
                  style={styles.checkbox}
                />
              </label>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>Lectura</div>
              
              <label style={styles.label}>
                <span>Fuente para dislexia</span>
                <input
                  type="checkbox"
                  checked={dyslexiaFont}
                  onChange={() => setDyslexiaFont(!dyslexiaFont)}
                  style={styles.checkbox}
                />
              </label>

              <label style={styles.label}>
                <span>Modo lectura fácil</span>
                <input
                  type="checkbox"
                  checked={easyReadMode}
                  onChange={() => setEasyReadMode(!easyReadMode)}
                  style={styles.checkbox}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* Estilos globales mejorados */
        
        /* Alto contraste - aplicado a todo el documento */
        html.aw-high-contrast,
        html.aw-high-contrast body,
        html.aw-high-contrast * {
          background-color: #000 !important;
          color: #fff !important;
          border-color: #fff !important;
        }
        
        html.aw-high-contrast a,
        html.aw-high-contrast button,
        html.aw-high-contrast input,
        html.aw-high-contrast select,
        html.aw-high-contrast textarea,
        html.aw-high-contrast [class*="btn"],
        html.aw-high-contrast [class*="button"] {
          color: #0ff !important;
          background-color: #000 !important;
          border: 2px solid #0ff !important;
        }
        
        html.aw-high-contrast a:hover,
        html.aw-high-contrast button:hover,
        html.aw-high-contrast input:hover,
        html.aw-high-contrast select:hover,
        html.aw-high-contrast textarea:hover {
          color: #ff0 !important;
          border-color: #ff0 !important;
          background-color: #111 !important;
        }

        /* Cursor grande - solución mejorada */
        html.aw-large-cursor,
        html.aw-large-cursor * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" fill="rgba(0,0,0,0.1)" stroke="black" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="black"/></svg>') 16 16, auto !important;
        }
        
        /* Cursor grande para inputs específicos */
        html.aw-large-cursor input,
        html.aw-large-cursor button,
        html.aw-large-cursor a,
        html.aw-large-cursor [role="button"],
        html.aw-large-cursor [onclick] {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="12" fill="rgba(0,123,255,0.2)" stroke="blue" stroke-width="3"/><circle cx="20" cy="20" r="4" fill="blue"/></svg>') 20 20, pointer !important;
        }

        /* Subrayar enlaces */
        html.aw-underline-links a,
        html.aw-underline-links [role="link"] {
          text-decoration: underline !important;
          text-decoration-thickness: 2px !important;
        }

        /* Fuente para dislexia */
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/OpenDyslexic-Regular.otf') format('opentype');
          font-weight: normal;
        }
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('https://cdn.jsdelivr.net/gh/antijingoist/open-dyslexic/OpenDyslexic-Bold.otf') format('opentype');
          font-weight: bold;
        }
        
        html.aw-dyslexia-font,
        html.aw-dyslexia-font * {
          font-family: 'OpenDyslexic', 'Comic Sans MS', Arial, sans-serif !important;
          letter-spacing: 0.03em !important;
          word-spacing: 0.1em !important;
        }

        /* Modo lectura fácil */
        html.aw-easy-read,
        html.aw-easy-read * {
          filter: grayscale(0.2) contrast(1.2) saturate(1.1) !important;
          line-height: 1.8 !important;
          letter-spacing: 0.02em !important;
          word-spacing: 0.05em !important;
        }

        /* Resaltar foco */
        html.aw-highlight-focus *:focus {
          outline: 3px solid #0078d4 !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 3px rgba(0, 120, 212, 0.3) !important;
        }

        /* Reducir animaciones */
        html.aw-reduce-motion,
        html.aw-reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* Tamaño de fuente variable */
        html {
          font-size: var(--accessible-font-size, 100%);
        }
      `}</style>
    </>
  );
}