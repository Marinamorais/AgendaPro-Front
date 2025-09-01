"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./HeaderComponent.module.css";
import Image from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// Importe seus componentes reais (ajuste os caminhos conforme seu projeto)
import LoginComponent from "../LoginComponent/page";
import RegisterComponent from "../RegisterComponent/page";

/**
 * Portal seguro para Next.js (somente no cliente)
 */
const Portal = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const elRef = useRef(null);

  if (!elRef.current && typeof document !== "undefined") {
    elRef.current = document.createElement("div");
    elRef.current.setAttribute("id", "modal-root");
  }

  useEffect(() => {
    if (!elRef.current) return;
    document.body.appendChild(elRef.current);
    setMounted(true);
    return () => {
      try { document.body.removeChild(elRef.current); } catch {}
    };
  }, []);

  return mounted ? createPortal(children, elRef.current) : null;
};

/**
 * Hook: bloqueia scroll do body enquanto o modal está aberto
 */
function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [active]);
}

/**
 * Hook: foco inicial e trap de Tab dentro do painel
 */
function useFocusTrap(active, containerRef) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const prev = document.activeElement;
    const selectors = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
      'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const focusables = Array.from(container.querySelectorAll(selectors));
    const toFocus = focusables.find(el => !el.hasAttribute('data-autofocus-disabled')) || container;
    toFocus?.focus?.();

    const onKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }
        const idx = focusables.indexOf(document.activeElement);
        let nextIdx = idx;
        if (e.shiftKey) nextIdx = idx <= 0 ? focusables.length - 1 : idx - 1;
        else nextIdx = idx === focusables.length - 1 ? 0 : idx + 1;
        e.preventDefault();
        focusables[nextIdx]?.focus?.();
      }
      if (e.key === 'Escape') {
        // será interceptado pelo manipulador no componente pai
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      if (prev && prev.focus) prev.focus();
    };
  }, [active, containerRef]);
}

const HeaderComponent = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(/** @type {"login"|"register"} */("login"));
  const panelRef = useRef(null);

  useBodyScrollLock(open);
  useFocusTrap(open, panelRef);

  const openLogin = useCallback(() => {
    setView("login");
    setOpen(true);
  }, []);
  const openRegister = useCallback(() => {
    setView("register");
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  // Atalhos: L = login, R = register, ESC = fechar
  useEffect(() => {
    const onKey = (e) => {
      // CORREÇÃO: Verifica se e.key existe antes de usá-lo.
      if (!e.key) return; 

      if (e.key.toLowerCase() === 'l' && !open) openLogin();
      if (e.key.toLowerCase() === 'r' && !open) openRegister();
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, openLogin, openRegister, close]);

  const Panel = useMemo(() => view === 'login' ? LoginComponent : RegisterComponent, [view]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          {/* Dica: certifique-se que este caminho da logo existe. */}
          <Image
  src="https://i.imgur.com/0SkCPnh.png"
  alt="Logo"
  width={48}
  height={48}
  priority
/>
          <span className={styles.brandText}>OiAgendaPro</span>
        </div>
        <nav className={styles.nav} aria-label="Ações de sessão">
          <button className={`${styles.btn} ${styles.ghost}`} onClick={openLogin} aria-haspopup="dialog" aria-controls="auth-modal">Login</button>
          <button className={`${styles.btn} ${styles.primary}`} onClick={openRegister} aria-haspopup="dialog" aria-controls="auth-modal">Registrar</button>
        </nav>
      </div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {open && (
          <Portal>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onMouseDown={(e) => {
                // Fechar clicando fora do painel
                if (e.target === e.currentTarget) close();
              }}
              aria-hidden={!open}
            >
              {/* Backdrop extras (glow rings) */}
              <div className={styles.glow} />
              <div className={styles.glow2} />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="auth-modal-title"
                id="auth-modal"
                ref={panelRef}
                className={styles.panel}
                initial={{ y: 24, scale: 0.98, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 12, scale: 0.98, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                tabIndex={-1}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') close();
                }}
              >
                <div className={styles.panelHeader}>
                  <h2 id="auth-modal-title" className={styles.panelTitle}>
                    {view === 'login' ? 'Entrar na conta' : 'Criar conta'}
                  </h2>
                  <button
                    className={styles.closeBtn}
                    onClick={close}
                    aria-label="Fechar modal"
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.panelBody}>
                  {/* Renderiza seu componente real */}
                  <Panel />
                </div>

                <div className={styles.panelFooter}>
                  {view === 'login' ? (
                    <button className={styles.linkBtn} onClick={() => setView('register')}>
                      Não tem conta? <span>Registrar</span>
                    </button>
                  ) : (
                    <button className={styles.linkBtn} onClick={() => setView('login')}>
                      Já tem conta? <span>Fazer login</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </Portal>
        )}
      </AnimatePresence>
    </header>
  );
};

export default HeaderComponent;