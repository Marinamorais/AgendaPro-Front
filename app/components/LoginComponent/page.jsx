// LoginComponent.js
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import styles from "./LoginComponent.module.css";

// 1. Acesse a variável de ambiente corretamente
const apiUrl = "https://agenda-pro-back.vercel.app/api";

const LoginComponent = ({ onLogin }) => {
  // 2. Mude 'username' para 'email' para corresponder à API
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. Transforme a função em async para usar await
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 4. Faça a requisição POST para a API de login
      const response = await fetch(`${apiUrl}/establishments/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a resposta não for 2xx, lança um erro com a mensagem da API
        throw new Error(data.message || 'Erro ao tentar fazer login.');
      }

      // 5. Se o login for bem-sucedido, salve o token e chame onLogin
      localStorage.setItem('authToken', data.token); // Salva o token no navegador
      onLogin(); // Avisa o componente pai que o login foi feito

    } catch (err) {
      // 6. Mostra o erro da API para o usuário
      setError(err.message);
    } finally {
      // 7. Garante que o loading sempre termine
      setLoading(false);
    }
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
              // 8. Atualize os campos para 'email'
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