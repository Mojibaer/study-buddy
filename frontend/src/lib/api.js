const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = {
  search: async (query, filters = {}) => {
    const params = new URLSearchParams({ query });
    if (filters.category) params.append('category', filters.category);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/search/semantic?${params}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    return response.json();
  },

  getDocuments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.subject) params.append('subject', filters.subject);

    const response = await fetch(`${API_BASE_URL}/documents?${params}`);
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
    if (metadata?.category) formData.append('category', metadata.category);
    if (metadata?.subject) formData.append('subject', metadata.subject);
    if (metadata?.semester) formData.append('semester', metadata.semester);
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
};