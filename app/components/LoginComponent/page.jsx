"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from "./LoginComponent.module.css";

const LoginComponent = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (username === "admin" && password === "123456") {
        onLogin();
      } else {
        setError("Usuário ou senha incorretos");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
        className={styles.loginBox}
      >
        <h2 className={styles.title}>Bem vindo!</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <span className={styles.icon}>👤</span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.icon}>🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <motion.button
            type="submit"
            className={styles.loginButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Login"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginComponent;
