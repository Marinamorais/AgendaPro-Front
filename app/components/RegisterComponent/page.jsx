"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import styles from "./RegisterComponent.module.css"

const RegisterComponent = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validação básica
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Preencha todos os campos!")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem!")
      return
    }

    setError("")
    console.log("Registrado com sucesso:", formData)
    // Aqui você pode enviar para sua API ou Firebase
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      <h2 className={styles.title}>Criar Conta</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="username">Nome de Usuário</label>
          <input
            type="text"
            id="username"
            placeholder="Digite seu nome"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="seuemail@exemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="telephone">Telefone</label>
          <input
            type="tel"
            id="telephone"
            placeholder="(11) 99999-9999"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirme sua senha"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <motion.button
          type="submit"
          className={styles.submitButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Registrar
        </motion.button>
      </form>
    </motion.div>
  )
}

export default RegisterComponent
