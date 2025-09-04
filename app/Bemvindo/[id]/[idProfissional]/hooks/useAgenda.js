"use client";
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../../service/api';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '../../contexts/ToastProvider';

/**
 * Hook customizado que atua como a "Fonte da Verdade" para os dados da agenda.
 */
export const useAgenda = (establishmentId, professionalId) => {
  const { addToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [professionalName, setProfessionalName] = useState("Carregando...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca o nome do profissional
  useEffect(() => {
    if (professionalId) {
      // CORREÇÃO: A chamada foi atualizada para usar o novo módulo 'professionals'.
      api.professionals.getById(professionalId)
        .then(data => setProfessionalName(data.full_name))
        .catch(() => setProfessionalName("Profissional não encontrado"));
    }
  }, [professionalId]);
  
  /**
   * Busca os agendamentos da SEMANA INTEIRA de uma vez para otimizar a performance.
   * Utiliza a função de hidratação do serviço de API para obter os dados completos.
   */
  const fetchAppointments = useCallback(async (date) => {
    if (!establishmentId || !professionalId) return;
    setLoading(true);
    setError(null);
    try {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

      const params = { 
        professional_id: professionalId,
        establishment_id: establishmentId,
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(weekEnd, 'yyyy-MM-dd'),
      };

      // A chamada agora usa a função de hidratação suprema.
      const data = await api.appointments.getAllHydrated(params);
      setAppointments(data);
    
    } catch (err) {
      setError("Não foi possível carregar os agendamentos.");
      addToast(err.message, 'error');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, professionalId, addToast]);

  useEffect(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

  // Função que a página pode chamar para forçar uma recarga dos dados.
  const refreshAgenda = useCallback(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

  const changeWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  return { currentDate, appointments, professionalName, loading, error, changeWeek, goToToday, refreshAgenda };
};