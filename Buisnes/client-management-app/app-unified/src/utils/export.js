export const exportToCSV = (data, filename, headers) => {
  if (!data || data.length === 0) {
    return;
  }

  // Create CSV content
  let csvContent = '';

  // Add headers if provided
  if (headers && headers.length > 0) {
    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
  }

  // Add data rows
  data.forEach((row) => {
    const values = Object.values(row).map((value) => {
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Handle dates
      if (value instanceof Date) {
        return `"${value.toISOString()}"`;
      }
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvContent += values.join(',') + '\n';
  });

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportProjectsToCSV = (projects) => {
  const headers = ['Title', 'Description', 'Client', 'Status', 'Priority', 'Created', 'Updated'];
  const data = projects.map((p) => ({
    Title: p.title,
    Description: p.description || '',
    Client: p.client_name || '',
    Status: p.status,
    Priority: p.priority,
    Created: new Date(p.created_at).toLocaleString(),
    Updated: new Date(p.updated_at).toLocaleString(),
  }));
  exportToCSV(data, 'projects', headers);
};

export const exportRequestsToCSV = (requests) => {
  const headers = ['Title', 'Description', 'Project', 'Status', 'Priority', 'Category', 'Created', 'Updated'];
  const data = requests.map((r) => ({
    Title: r.title,
    Description: r.description || '',
    Project: r.project_title || '',
    Status: r.status,
    Priority: r.priority,
    Category: r.category,
    Created: new Date(r.created_at).toLocaleString(),
    Updated: new Date(r.updated_at).toLocaleString(),
  }));
  exportToCSV(data, 'requests', headers);
};
