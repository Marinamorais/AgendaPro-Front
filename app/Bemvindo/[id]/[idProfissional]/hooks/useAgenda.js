"use client";
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../../service/api';
import { format } from 'date-fns';
import { useToast } from '../../contexts/ToastProvider';

/**
 * Hook customizado para gerenciar o estado e os dados da agenda.
 * Responsável por buscar agendamentos e controlar a data da semana.
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
      api.getById('professionals', professionalId)
        .then(data => setProfessionalName(data.full_name))
        .catch(() => setProfessionalName("Profissional não encontrado"));
    }
  }, [professionalId]);
  
  // Função para buscar os agendamentos
  const fetchAppointments = useCallback(async (date) => {
    if (!establishmentId || !professionalId) return;
    setLoading(true);
    setError(null);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const params = { professional_id: professionalId, date: formattedDate };
      const data = await api.get('appointments', params);
      setAppointments(data || []);
    } catch (err) {
      // Se não encontrar agendamentos, mostra a agenda vazia em vez de um erro.
      if (err.message.includes('404')) {
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

  // Função para forçar a atualização da agenda, chamada pela página principal.
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
    refreshAgenda, // Expondo a função para recarregar
  };
};