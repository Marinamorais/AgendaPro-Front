"use client";
import React from "react";
import styles from "./FooterComponent.module.css";

const FooterComponent = () => {
  return (
    <footer className={styles.footer}>

      <div className={styles.copy}>
        &copy; {new Date().getFullYear()} OiAgendaPro. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default FooterComponent;
