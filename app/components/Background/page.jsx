"use client";
import React, { useEffect } from "react";
import styles from "./Background.module.css";

export default function Background() {
  useEffect(() => {
    const container = document.querySelector(`.${styles.stars}`);
    if (!container) return;

    // Gera várias estrelas aleatórias
    for (let i = 0; i < 20; i++) {
      const star = document.createElement("div");
      star.className = styles.star;
      star.style.left = Math.random() * 100 + "%";
      star.style.animationDuration = 10 + Math.random() * 15 + "s";
      star.style.animationDelay = Math.random() * 10 + "s";
      container.appendChild(star);
    }
  }, []);

  return (
    <div className={styles.background}>
      <div className={styles.grid}></div>
      <div className={styles.stars}></div>
    </div>
  );
}
