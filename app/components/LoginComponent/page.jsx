"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation'; // 1. Importe o useRouter
import styles from "./LoginComponent.module.css";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const LoginComponent = () => { // 2. Remova 'onLogin' das props
  const router = useRouter(); // 3. Inicialize o roteador
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!apiUrl) {
      setError("Erro de configuração: A URL da API não foi encontrada.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/establishments/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao tentar fazer login.');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('establishment', JSON.stringify(data.establishment));
      
      // 4. Redirecione para a página de boas-vindas com o ID do estabelecimento
      router.push(`/Bemvindo/${data.establishment.id}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // O resto do seu componente continua igual...
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
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.icon}>🔒</span>
            <input
              type="password"
              placeholder="Senha"
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
            {loading ? "Entrando..." : "Login"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginComponent;