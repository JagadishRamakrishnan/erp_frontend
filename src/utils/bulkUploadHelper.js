// Helper functions for bulk upload functionality

export const createBulkUploadMethods = (moduleName, apiBaseUrl) => {
  const handleBulkUpload = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = apiBaseUrl || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/${moduleName}/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = apiBaseUrl || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/${moduleName}/template/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${moduleName}_template.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download template');
      }
    } catch (error) {
      throw error;
    }
  };

  return { handleBulkUpload, handleDownloadTemplate };
};

// Template field configurations for each module
export const moduleTemplateFields = {
  leads: ['name', 'email', 'phone', 'company', 'source', 'status', 'assigned_to'],
  customers: ['name', 'email', 'phone', 'company', 'address', 'city', 'state', 'country', 'postal_code'],
  deals: ['deal_name', 'customer_id', 'value', 'stage', 'probability', 'expected_close_date', 'assigned_to'],
  tasks: ['title', 'description', 'due_date', 'priority', 'status', 'assigned_to', 'related_to', 'related_id'],
  activities: ['activity_type', 'subject', 'description', 'activity_date', 'related_to', 'related_id'],
  quotations: ['customer_id', 'deal_id', 'quotation_date', 'valid_until', 'total_amount', 'terms', 'status'],
  invoices: ['customer_id', 'deal_id', 'quotation_id', 'invoice_date', 'due_date', 'total_amount', 'paid_amount', 'status'],
  payments: ['customer_id', 'invoice_id', 'deal_id', 'amount', 'payment_date', 'payment_method', 'reference_number', 'notes'],
  tickets: ['title', 'description', 'customer_id', 'priority', 'status', 'assigned_to', 'category'],
  notes: ['title', 'content', 'related_to', 'related_id']
};