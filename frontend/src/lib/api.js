const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = {
  // Filters
  getFilters: async () => {
    const response = await fetch(`${API_BASE_URL}/filters/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch filters');
    }
    return response.json();
  },

  // Search
  search: async (query, filters = {}) => {
    const params = new URLSearchParams({ query });
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.subject_id) params.append('subject_id', filters.subject_id);
    if (filters.semester_id) params.append('semester_id', filters.semester_id);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/search/semantic?${params}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return response.json();
  },

  // Documents
  getDocuments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.subject_id) params.append('subject_id', filters.subject_id);
    if (filters.semester_id) params.append('semester_id', filters.semester_id);

    const response = await fetch(`${API_BASE_URL}/documents/?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    return response.json();
  },

  getDocument: async (id) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }
    return response.json();
  },

  uploadDocument: async (file, metadata) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.category_id) formData.append('category_id', metadata.category_id);
    if (metadata?.subject_id) formData.append('subject_id', metadata.subject_id);
    if (metadata?.tags) formData.append('tags', metadata.tags);

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }
    return response.json();
  },

  deleteDocument: async (id) => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
    return response.json();
  },
};