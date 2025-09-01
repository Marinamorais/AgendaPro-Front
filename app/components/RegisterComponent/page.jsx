"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "./RegisterComponent.module.css";
import { registerEstablishment } from "../../services/api"; // Importa a função de registro do nosso serviço de API

const RegisterComponent = () => {
  const router = useRouter();

  // Um único estado para o formulário, alinhado com os campos da API
  const [formData, setFormData] = useState({
    name: "",
    trade_name: "",
    email: "",
    phone: "",
    plan: "teste", // Plano padrão
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Uma única função para gerenciar a mudança em todos os inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Lógica de submissão do formulário para o backend
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
      // Usa a função do nosso serviço de API para fazer a requisição
      await registerEstablishment({
        name: formData.name,
        trade_name: formData.trade_name,
        email: formData.email,
        phone: formData.phone,
        plan: formData.plan,
        password: formData.password,
      });

      // Se o registro for bem-sucedido, redireciona para a página de login com uma mensagem
      alert("Registro realizado com sucesso! Você será redirecionado para a página de login.");
      router.push('/'); 

    } catch (err) {
      // Captura o erro retornado pelo Axios e exibe a mensagem da API
      setError(err.response?.data?.message || "Falha ao registrar. Tente novamente.");
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
      <h2 className={styles.title}>Crie sua Conta OiAgendaPro</h2>
      <p className={styles.subtitle}>Comece a transformar seu negócio hoje mesmo.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
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
          <label htmlFor="email">Seu Melhor Email</label>
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
          <label htmlFor="phone">Telefone / WhatsApp (Opcional)</label>
          <input
            type="tel"
            id="phone"
            placeholder="(55) 99999-9999"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Crie uma Senha</label>
          <input
            type="password"
            id="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirme sua Senha</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Repita a senha"
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
          {loading ? "Criando conta..." : "Começar Teste Grátis de 14 Dias"}
        </motion.button>
         <div className={styles.footer}>
            <p>Já tem uma conta? <a href="/">Faça login</a></p>
        </div>
      </form>
    </motion.div>
  );
};

export default RegisterComponent;
