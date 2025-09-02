"use client";
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../../service/api'; // Ajuste o caminho se necessário

// Este hook encapsula toda a lógica de estado e dados da agenda.
export const useAgenda = (establishmentId, professionalId) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      // Formata a data para YYYY-MM-DD para enviar à API
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(`/establishments/${establishmentId}/appointments`, {
        params: {
          professionalId: professionalId,
          date: formattedDate, // Filtra por data no backend
        }
      });
      // Simulação de dados caso a API não retorne o esperado
      const mockData = [
          { id: 1, date: formattedDate, start_time: '09:00', duration_minutes: 60, client_name: 'Ana Silva', service_name: 'Corte Feminino', status: 'Confirmado' },
          { id: 2, date: formattedDate, start_time: '11:00', duration_minutes: 90, client_name: 'Bruno Costa', service_name: 'Coloração', status: 'Agendado' },
          { id: 3, date: formattedDate, start_time: '14:30', duration_minutes: 30, client_name: 'Carlos Dias', service_name: 'Barba', status: 'Finalizado' },
          { id: 4, date: formattedDate, start_time: '16:00', duration_minutes: 45, client_name: 'Daniela Faria', service_name: 'Manicure', status: 'Cancelado' },
      ];
      setAppointments(response.data.length > 0 ? response.data : mockData);

    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setError("Não foi possível carregar os agendamentos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, [establishmentId, professionalId]);

  useEffect(() => {
    if (establishmentId && professionalId) {
      fetchAppointments(currentDate);
    }
  }, [establishmentId, professionalId, currentDate, fetchAppointments]);

  const changeDate = (newDate) => {
    setCurrentDate(new Date(newDate));
  };

  const updateAppointmentStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointments(prev =>
        prev.map(app => app.id === appointmentId ? { ...app, status: newStatus } : app)
      );
      return true; // Sucesso
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      return false; // Falha
    }
  }, []);

  const moveAppointment = useCallback(async (appointmentId, newDate, newStartTime) => {
    const originalAppointments = [...appointments];
    // Otimistic UI update
    const updatedApp = appointments.find(app => app.id === appointmentId);
    if (!updatedApp) return false;
    
    const optimisticUpdate = { ...updatedApp, date: newDate, start_time: newStartTime };

    setAppointments(prev => prev.map(app => app.id === appointmentId ? optimisticUpdate : app));
    
    try {
      await api.put(`/appointments/${appointmentId}/reschedule`, { 
          date: newDate.toISOString().split('T')[0], 
          start_time: newStartTime 
      });
      return true;
    } catch (err) {
      console.error("Erro ao reagendar:", err);
      setAppointments(originalAppointments); // Reverte em caso de erro
      return false;
    }
  }, [appointments]);
  
  const createAppointment = useCallback(async (appointmentData) => {
      try {
          const response = await api.post(`/appointments`, appointmentData);
          setAppointments(prev => [...prev, response.data]);
          return true;
      } catch (err) {
          console.error("Erro ao criar agendamento:", err);
          return false;
      }
  }, []);


  return {
    currentDate,
    appointments,
    loading,
    error,
    changeDate,
    fetchAppointments,
    updateAppointmentStatus,
    moveAppointment,
    createAppointment,
  };
};