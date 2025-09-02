// arquivo: app/Bemvindo/[id]/hooks/useApi.js
import { useState, useCallback, useContext } from 'react';
import { ToastContext } from '../contexts/ToastProvider';
import { useRouter } from 'next/navigation';

export const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showToast } = useContext(ToastContext);
    const router = useRouter();

    const request = useCallback(async (...args) => {
        setLoading(true);
        setError(null);
        
        let originalData = data; // Salva o estado atual para rollback em caso de erro

        // *** ADIÇÃO DE CÓDIGO PARA OTIMISTIC UI ***
        // Se a chamada for de agendamento (POST ou PUT), atualizamos a UI antes da resposta.
        // É uma suposição baseada em como a função `apiFunction` será usada.
        const isAppointmentAction = args[0] === 'post' || args[0] === 'put';
        if (isAppointmentAction && args[1].includes('appointments')) {
            try {
                // Tentativa de simular a resposta da API para atualizar a UI
                const mockResponse = { data: { ...args[2].data, id: 'temp-id-' + Date.now() }, status: 201 };
                setData(prev => {
                    if (!prev || !prev.data) return { data: [mockResponse.data] };
                    const newItems = prev.data.filter(item => item.id !== mockResponse.data.id);
                    return { data: [...newItems, mockResponse.data] };
                });
            } catch (uiError) {
                // Se der erro na simulação, não fazemos nada
            }
        }
        // **********************************************
        
        try {
            const response = await apiFunction(...args);
            setData(response.data);
            showToast('Sucesso!', 'success'); // Exibe a notificação de sucesso
            return response.data;
        } catch (err) {
            setError(err);
            // *** ADIÇÃO DE CÓDIGO PARA OTIMISTIC UI ***
            // Em caso de falha, reverte a UI para o estado original
            if (isAppointmentAction && originalData) {
                setData(originalData);
            }
            // **********************************************
            
            showToast(`Erro: ${err.message}`, 'error'); // Exibe a notificação de erro
            if (err.response && err.response.status === 401) {
                router.push('/login');
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction, showToast, router, data]);

    return { data, loading, error, request, setData, setError };
};