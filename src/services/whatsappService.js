import apiCall from './api';

const whatsappService = {
  getCustomers: () => apiCall('/whatsapp/customers'),

  sendCampaign: (data) =>
    apiCall('/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default whatsappService;
