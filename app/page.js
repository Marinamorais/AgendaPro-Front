"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [dados, setDados] = useState([
    { sku: "A-1001", nome: "Fone ZX-200", preco: 149.9, otimo: 139.9, elastic: -1.6, status: "Rever" },
    { sku: "A-1002", nome: "Mouse Aero Lite", preco: 89.9, otimo: 94.9, elastic: -0.7, status: "Ok" },
    { sku: "A-1044", nome: "Teclado MK Pro", preco: 349.9, otimo: 349.9, elastic: -0.3, status: "Ok" },
    { sku: "B-2011", nome: "Smartwatch Wave", preco: 799.0, otimo: 749.0, elastic: -1.2, status: "Rever" },
    { sku: "B-2032", nome: "Speaker Bass+ Mini", preco: 219.0, otimo: 229.0, elastic: -0.8, status: "Ok" },
    { sku: "C-3342", nome: "Câmera Action S", preco: 1299.0, otimo: 1249.0, elastic: -1.1, status: "Rever" },
  ]);

  const [simulador, setSimulador] = useState({
    preco: 120.0,
    desconto: 10,
    resultado: {
      precoFinal: 108.0,
      volume: "+7.8%",
      receita: "+3.9%",
      margem: "-1.2 p.p.",
    },
  });

  const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const calcularSimulador = () => {
    const preco = simulador.preco;
    const desconto = simulador.desconto / 100;
    const novoPreco = preco * (1 - desconto);
    const elasticidade = -1.1;
    const deltaVolume = -(elasticidade * desconto) * 100;
    const deltaReceita = (1 - desconto) * (1 + deltaVolume / 100) - 1;
    const deltaMargem = -(desconto * 0.12) * 100;

    setSimulador((prev) => ({
      ...prev,
      resultado: {
        precoFinal: novoPreco,
        volume: `${deltaVolume >= 0 ? "+" : ""}${deltaVolume.toFixed(1)}%`,
        receita: `${deltaReceita >= 0 ? "+" : ""}${(deltaReceita * 100).toFixed(1)}%`,
        margem: `${deltaMargem.toFixed(1)} p.p.`,
      },
    }));
  };

  useEffect(() => {
    calcularSimulador();
  }, [simulador.preco, simulador.desconto]);

  return (
    <div>
      <header className={styles.header}>
        <div className={`${styles.container} ${styles.row}`}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true"></div>
            <b>CR&nbsp;Mlytics</b>
          </div>
          <nav>
            <a href="#precos">Preços</a>
            <a href="#ofertas">Ofertas</a>
            <a href="#itens">Itens</a>
            <a href="#simulador">Simulador</a>
            <a className={`${styles.btn} ${styles.cta}`} href="#começar">
              Começar
            </a>
          </nav>
        </div>
      </header>

      <main className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.spark} aria-hidden="true"></div>
          <h1>Ajustar estratégia de preços e ofertas</h1>
          <p>
            Uma página estática em um único arquivo HTML que simula um painel de insights de elasticidade, receita e
            recomendações de promoção. Edite os dados abaixo e veja o impacto estimado.
          </p>
          <div className={styles.actions}>
            <button className={`${styles.btn} ${styles.primary}`}>Experimentar o simulador</button>
            <button className={styles.btn}>Baixar esta página</button>
          </div>
        </section>

        <section className={styles.grid} aria-label="KPIs de topo">
          <div className={styles.card} style={{ gridColumn: "span 3" }}>
            <h3>Receita estimada</h3>
            <div className={styles.kpi}>R$ 1.234.560</div>
            <div className={styles.trend}>+4,2% vs. mês anterior</div>
          </div>
          <div className={styles.card} style={{ gridColumn: "span 3" }}>
            <h3>Margem média</h3>
            <div className={styles.kpi}>28,6%</div>
            <div className={styles.trend}>estável</div>
          </div>
          <div className={styles.card} style={{ gridColumn: "span 3" }}>
            <h3>Itens sensíveis a preço</h3>
            <div className={styles.kpi}>37</div>
            <div className={styles.trend}>priorize estes SKU</div>
          </div>
          <div className={styles.card} style={{ gridColumn: "span 3" }}>
            <h3>Campanhas ativas</h3>
            <div className={styles.kpi}>5</div>
            <div className={styles.trend}>2 encerram em 7 dias</div>
          </div>
        </section>

        <section id="simulador" className={styles.card} style={{ marginTop: "16px" }}>
          <div className={styles.panelTitle}>
            <h3>Simulador de impacto</h3>
            <span className={styles.hint}>Ajuste preço e desconto para ver o efeito estimado</span>
          </div>
          <div className={styles.simulador}>
            <div>
              <label>Preço base (R$)</label>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="0.01"
                value={simulador.preco}
                onChange={(e) => setSimulador({ ...simulador, preco: parseFloat(e.target.value) })}
              />
              <div style={{ height: "8px" }}></div>
              <label>Desconto promocional (%)</label>
              <input
                className={styles.slider}
                type="range"
                min="0"
                max="40"
                value={simulador.desconto}
                onChange={(e) => setSimulador({ ...simulador, desconto: parseInt(e.target.value, 10) })}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                <input
                  className={styles.input}
                  style={{ maxWidth: "120px" }}
                  type="number"
                  min="0"
                  max="40"
                  value={simulador.desconto}
                  onChange={(e) => setSimulador({ ...simulador, desconto: parseInt(e.target.value, 10) })}
                />
                <button className={styles.btn} onClick={() => setSimulador({ preco: 120.0, desconto: 10 })}>
                  Resetar
                </button>
              </div>
            </div>
            <div>
              <div className={styles.card} style={{ margin: 0 }}>
                <h3>Resultado estimado</h3>
                <div className={styles.kpi}>{moeda(simulador.resultado.precoFinal)}</div>
                <div className={styles.trend}>Volume: {simulador.resultado.volume}</div>
                <div className={styles.trend}>Receita: {simulador.resultado.receita}</div>
                <div className={styles.trend}>Margem: {simulador.resultado.margem}</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
