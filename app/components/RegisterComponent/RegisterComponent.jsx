"use client";
import { useState, useEffect } from "react";
import { createCliente, createProfissional } from "../services/api";
import api from "../services/api";

export default function RegisterComponent() {
  const [tipo, setTipo] = useState("cliente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [valorGasto, setValorGasto] = useState(0);
  const [frequencia, setFrequencia] = useState(0);
  const [valorPerdido, setValorPerdido] = useState(0);
  const [valorRecebido, setValorRecebido] = useState(0);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [estabelecimentoId, setEstabelecimentoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState(false);

  // Busca estabelecimentos da API
  useEffect(() => {
    async function fetchEstabelecimentos() {
      try {
        const res = await api.get("/estabelecimentos");
        setEstabelecimentos(res.data);
      } catch (error) {
        console.error("Erro ao carregar estabelecimentos:", error);
      }
    }
    fetchEstabelecimentos();
  }, []);

  const validarEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validarTelefone = (tel) => /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(tel);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro(false);

    if (!nome || !email || !estabelecimentoId) {
      setMensagem("Preencha todos os campos obrigatórios!");
      setErro(true);
      return;
    }

    if (!validarEmail(email)) {
      setMensagem("Email inválido!");
      setErro(true);
      return;
    }

    if (telefone && !validarTelefone(telefone)) {
      setMensagem("Telefone inválido! Formato: (99) 99999-9999");
      setErro(true);
      return;
    }

    const dataBase = { nome, email, telefone, estabelecimento_id: Number(estabelecimentoId) };

    try {
      if (tipo === "cliente") {
        const dataCliente = {
          ...dataBase,
          valor_gasto: Number(valorGasto),
          frequencia: Number(frequencia),
          valor_perdido: Number(valorPerdido),
        };
        await createCliente(dataCliente);
      } else {
        const dataProfissional = { ...dataBase, valor_recebido: Number(valorRecebido) };
        await createProfissional(dataProfissional);
      }

      setMensagem(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} cadastrado com sucesso!`);
      setErro(false);

      // Resetar campos
      setNome(""); setEmail(""); setTelefone("");
      setValorGasto(0); setFrequencia(0); setValorPerdido(0); setValorRecebido(0);
      setEstabelecimentoId("");

    } catch (error) {
      setMensagem("Erro ao cadastrar!");
      setErro(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "400px", gap: "10px", margin: "0 auto" }}>
      <h2>Cadastrar Pessoa</h2>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="cliente">Cliente</option>
        <option value="profissional">Profissional</option>
      </select>

      <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input placeholder="Telefone (99) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

      <select value={estabelecimentoId} onChange={(e) => setEstabelecimentoId(e.target.value)} required>
        <option value="">Escolha o estabelecimento</option>
        {estabelecimentos.map((est) => (
          <option key={est.id} value={est.id}>{est.nome}</option>
        ))}
      </select>

      {tipo === "cliente" && (
        <>
          <input type="number" placeholder="Valor Gasto" value={valorGasto} min={0} step={0.01} onChange={(e) => setValorGasto(e.target.value)} />
          <input type="number" placeholder="Frequência" value={frequencia} min={0} step={1} onChange={(e) => setFrequencia(e.target.value)} />
          <input type="number" placeholder="Valor Perdido" value={valorPerdido} min={0} step={0.01} onChange={(e) => setValorPerdido(e.target.value)} />
        </>
      )}

      {tipo === "profissional" && (
        <input type="number" placeholder="Valor Recebido" value={valorRecebido} min={0} step={0.01} onChange={(e) => setValorRecebido(e.target.value)} />
      )}

      <button type="submit" style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", border: "none", cursor: "pointer" }}>
        Cadastrar {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </button>

      {mensagem && <p style={{ color: erro ? "red" : "green", fontWeight: "bold" }}>{mensagem}</p>}
    </form>
  );
}
