"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import styles from "./LoginComponent.module.css";

// Acessa a URL da API a partir das variáveis de ambiente
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const LoginComponent = () => {
  const router = useRouter();
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

      // Armazena o token e os dados do estabelecimento no navegador
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('establishment', JSON.stringify(data.establishment));
      
      // Redireciona para o dashboard principal
      router.push(`/Bemvindo/${data.establishment.id}`);

    } catch (err) {
      setError(err.message);
    } finally {
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
        <h2 className={styles.title}>Bem-vindo de volta!</h2>
        <p className={styles.subtitle}>Acesse seu centro de comando.</p>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <span className={styles.icon}>👤</span>
            <input
              type="email"
              placeholder="E-mail do estabelecimento"
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
            {loading ? "Verificando..." : "Entrar"}
          </motion.button>
        </form>
         <div className={styles.footer}>
            <p>Não tem uma conta? <a href="/register">Crie uma agora</a></p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginComponent;
