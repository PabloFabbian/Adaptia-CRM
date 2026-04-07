import api from './config'; // Asumiendo que tienes una instancia de axios configurada

export const getTemplates = () => api.get('/documents/templates');
export const signDocument = (data) => api.post('/documents/sign', data);