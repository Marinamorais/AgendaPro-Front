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

  useEffect(() => {
    if (professionalId) {
      api.getById('professionals', professionalId)
        .then(data => setProfessionalName(data.full_name))
        .catch(() => setProfessionalName("Profissional não encontrado"));
    }
  }, [professionalId]);
  
  /**
   * Busca os agendamentos da SEMANA INTEIRA de uma vez para otimizar a performance.
   */
  const fetchAppointments = useCallback(async (date) => {
    if (!establishmentId || !professionalId) return;
    setLoading(true);
    setError(null);
    try {
      // Define o início e o fim da semana com base na data atual.
      const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Começa na Segunda
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

      const params = { 
        professional_id: professionalId,
        start_date: format(weekStart, 'yyyy-MM-dd'),
        end_date: format(weekEnd, 'yyyy-MM-dd'),
        _embed: 'client,service' // Pede ao backend para incluir dados do cliente e serviço
      };

      const data = await api.get('appointments', params);
      setAppointments(data || []);
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        setAppointments([]);
      } else {
        setError("Não foi possível carregar os agendamentos.");
        addToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [establishmentId, professionalId, addToast]);

  useEffect(() => {
    fetchAppointments(currentDate);
  }, [currentDate, fetchAppointments]);

  // Função vital que permite à página forçar uma recarga dos dados.
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

  return {
    currentDate,
    appointments,
    professionalName,
    loading,
    error,
    changeWeek,
    goToToday,
    refreshAgenda,
  };
};