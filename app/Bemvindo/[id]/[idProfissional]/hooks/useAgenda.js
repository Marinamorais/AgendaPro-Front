"use client";
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../../service/api'; // Certifique-se que o caminho está correto
import { format } from 'date-fns';

/**
 * @module hooks/useAgenda
 * @description Hook customizado que encapsula toda a lógica de estado e
 * comunicação com a API para a página de agenda de um profissional.
 */
export const useAgenda = (establishmentId, professionalId) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [professionalName, setProfessionalName] = useState("Carregando...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca o nome do profissional uma única vez
  useEffect(() => {
    if (professionalId) {
      api.getById('professionals', professionalId)
        .then(data => setProfessionalName(data.full_name))
        .catch(() => setProfessionalName("Profissional não encontrado"));
    }
  }, [professionalId]);
  
  /**
   * Busca os agendamentos para um profissional em uma data específica.
   * A função agora trata a ausência de agendamentos (erros 404) como um
   * array vazio, em vez de um erro de aplicação.
   */
  const fetchAppointments = useCallback(async (date) => {
    if (!establishmentId || !professionalId) return;

    setLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const fetchedAppointments = await api.get('appointments', {
        professional_id: professionalId,
        date: formattedDate,
      });

      // A API retornou dados, então atualizamos o estado.
      setAppointments(fetchedAppointments || []);

    } catch (err) {
      // CORREÇÃO PRINCIPAL:
      // Se o erro da API contiver uma mensagem indicando "não encontrado"
      // ou se simplesmente não houver agendamentos, consideramos a lista vazia.
      // Isso evita que a tela de erro seja mostrada desnecessariamente.
      if (err.message && err.message.toLowerCase().includes('não encontrado')) {
        setAppointments([]); // Define como vazio, que é o estado correto
      } else {
        // Para outros erros (falha de rede, erro de servidor), mostramos a mensagem.
        console.error("Erro ao buscar agendamentos:", err);
        setError("Não foi possível carregar os agendamentos. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  }, [establishmentId, professionalId]);

  useEffect(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

  const changeWeek = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const refreshAgenda = useCallback(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);


  const createAppointment = useCallback(async (appointmentData) => {
      try {
          const payload = {
            ...appointmentData,
            professional_id: professionalId,
            establishment_id: establishmentId,
          };
          await api.create('appointments', payload);
          refreshAgenda(); // Atualiza a agenda para mostrar o novo item
          return { success: true };
      } catch (err) {
          console.error("Erro ao criar agendamento:", err);
          return { success: false, message: err.message };
      }
  }, [professionalId, establishmentId, refreshAgenda]);
  
    const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      await api.update('appointments', appointmentId, { status: newStatus });
      refreshAgenda();
      return { success: true };
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      return { success: false, message: err.message };
    }
  }, [refreshAgenda]);


  return {
    currentDate,
    appointments,
    professionalName,
    loading,
    error,
    changeWeek,
    goToToday,
    refreshAgenda,
    createAppointment,
    updateAppointmentStatus,
  };
};