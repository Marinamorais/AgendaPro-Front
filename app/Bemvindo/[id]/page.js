"use client"; // Precisa ser um Client Component para usar hooks e localStorage
import React, { useEffect, useState } from 'react';

const BemVindoPage = () => {
  const [establishmentName, setEstablishmentName] = useState('');

  useEffect(() => {
    // Este código só roda no navegador, após o componente ser montado
    const establishmentData = localStorage.getItem('establishment');

    if (establishmentData) {
      // Converte a string JSON de volta para um objeto
      const establishmentObject = JSON.parse(establishmentData);
      // Pega o nome do estabelecimento e salva no estado do componente
      setEstablishmentName(establishmentObject.name);
    }
  }, []); // O array vazio [] garante que este efeito rode apenas uma vez

  return (
    <div>
      <h1>Bem-vindo, {establishmentName || 'Carregando...'}!</h1>
      {/* Aqui você pode começar a construir o seu dashboard */}
    </div>
  );
};

export default BemVindoPage;