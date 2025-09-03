"use client";

/**
 * @module BemVindo/Layout
 * @description Layout MESTRE para toda a área autenticada do sistema (`/Bemvindo/*`).
 * A SOLUÇÃO DEFINITIVA para o erro de contexto está aqui.
 *
 * Em vez de colocar o ToastProvider em cada página individualmente (o que é frágil e causa os erros que você viu),
 * nós o colocamos NESTE layout. O Next.js garante que este componente "envolva"
 * qualquer `page.js` renderizada dentro do diretório `/Bemvindo` e seus subdiretórios.
 *
 * Isso significa que `/Bemvindo/[id]`, `/Bemvindo/[id]/[idProfissional]` e qualquer outra
 * página que você criar aqui dentro ESTARÃO AUTOMATICAMENTE DENTRO DO TOASTPROVIDER.
 *
 * Problema resolvido na raiz, para sempre.
 */

// CORREÇÃO: O caminho foi ajustado para ser relativo ao diretório atual.
// O arquivo de layout já está em '/[id]', então precisamos apenas apontar
// para a pasta 'contexts' que está no mesmo nível.
import { ToastProvider } from './contexts/ToastProvider';

/**
 * O componente de Layout.
 * @param {{ children: React.ReactNode }} props - `children` será o componente `page.js`
 * que o Next.js está renderizando para a rota atual.
 * @returns {JSX.Element}
 */
export default function BemVindoLayout({ children }) {
  // A estrutura é simples: o Provedor envolve os 'children'.
  // Qualquer chamada ao `useToast()` dentro dos `children` agora vai funcionar perfeitamente.
  return (
    <ToastProvider>
      {/* A mágica acontece aqui. O {children} será substituído pelo seu page.js */}
      {children}
    </ToastProvider>
  );
}