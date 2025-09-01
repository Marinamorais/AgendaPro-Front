"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation"; // 1. Importa o useRouter para redirecionamento
import styles from "./RegisterComponent.module.css";

// Busca a URL da API do arquivo .env
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const RegisterComponent = () => {
  const router = useRouter(); // Inicializa o roteador

  // 2. Alinha o estado do formulário com os campos esperados pela API
  const [formData, setFormData] = useState({
    name: "",          // 'name' em vez de 'username'
    trade_name: "",    // Adiciona o nome fantasia
    email: "",
    phone: "",         // Renomeado de 'telephone' para 'phone'
    plan: "teste",   // Define um plano padrão
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. Cria uma única função 'handleChange' para todos os inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // 4. Implementa a lógica de submissão para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/establishments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Envia apenas os dados que a API espera, sem o 'confirmPassword'
        body: JSON.stringify({
          name: formData.name,
          trade_name: formData.trade_name,
          email: formData.email,
          phone: formData.phone,
          plan: formData.plan,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha ao registrar.");
      }

      // 5. Sucesso! Redireciona o usuário para a página de login.
      alert("Registro realizado com sucesso! Você será redirecionado para o login.");
      router.push('/'); // Assumindo que a rota '/' é a de login

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      <h2 className={styles.title}>Criar Conta de Estabelecimento</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Inputs atualizados para usar 'handleChange' e os novos 'id's */}
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome do Estabelecimento</label>
          <input
            type="text"
            id="name"
            placeholder="Ex: Estética Bella Pele"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="trade_name">Nome Fantasia (Opcional)</label>
          <input
            type="text"
            id="trade_name"
            placeholder="Ex: Bella Pele"
            value={formData.trade_name}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email de Acesso</label>
          <input
            type="email"
            id="email"
            placeholder="seuemail@exemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone">Telefone (Opcional)</label>
          <input
            type="tel"
            id="phone"
            placeholder="(55) 99999-9999"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <motion.button
          type="submit"
          className={styles.submitButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          {loading ? "Registrando..." : "Criar Conta"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default RegisterComponent;