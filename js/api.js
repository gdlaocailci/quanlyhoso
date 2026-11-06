const API = {
  fileToBase64: function(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = e => reject(e);
      reader.readAsDataURL(file);
    });
  },
  login: async function(email) {
    const res = await fetch(CONFIG.API_URL + '?action=getProfile&email=' + encodeURIComponent(email));
    return await res.json();
  },
  getDocuments: async function(email, filters = {}) {
    let url = CONFIG.API_URL + '?action=getDocuments&email=' + encodeURIComponent(email);
    if (filters.status) url += '&status=' + encodeURIComponent(filters.status);
    if (filters.department) url += '&department=' + encodeURIComponent(filters.department);
    const res = await fetch(url);
    return await res.json();
  },
  getCategories: async function(email) {
    const res = await fetch(CONFIG.API_URL + '?action=getCategories&email=' + encodeURIComponent(email));
    return await res.json();
  },
  getStats: async function(email) {
    const res = await fetch(CONFIG.API_URL + '?action=getStats&email=' + encodeURIComponent(email));
    return await res.json();
  },
  uploadDocument: async function(email, docData, file) {
    const base64Data = await this.fileToBase64(file);
    const payload = {
      action: 'uploadDocument',
      email: email,
      category: docData.category,
      title: docData.title,
      week: docData.week,
      schoolYear: docData.schoolYear,
      fileData: {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data: base64Data
      }
    };
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },
  reviewDocument: async function(email, docId, department, status, feedback) {
    const payload = {
      action: 'reviewDocument',
      email: email,
      docId: docId,
      department: department,
      status: status,
      feedback: feedback
    };
    const res = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
};
