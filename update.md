# 📝 Frontend Changes - Employee Document Management

Dokumentasi perubahan API untuk fitur upload, preview, dan delete dokumen employee.

## 🔄 Breaking Changes

### 1. Create Employee API
**Endpoint:** `POST /api/employees`

#### ❌ Before (Old Implementation)
```javascript
// JSON Request
const response = await fetch('/api/employees', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    full_name: 'John Doe',
    nik: '1234567890',
    nip: '20260227001'
  })
});
```

#### ✅ After (New Implementation)
```javascript
// FormData Request (Required for file uploads)
const formData = new FormData();
formData.append('full_name', 'John Doe');
formData.append('nik', '1234567890');
formData.append('nip', '20260227001');

// Optional: Add documents
if (selectedFiles.length > 0) {
  selectedFiles.forEach(file => {
    formData.append('documents[]', file);
  });
}

const response = await fetch('/api/employees', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // ⚠️ DO NOT set Content-Type header! Browser will set it automatically with boundary
  },
  body: formData
});
```

#### 📤 Response Changes
```javascript
// Old Response
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "uuid": "...",
    "full_name": "John Doe",
    "nik": "1234567890"
  }
}

// New Response (with documents)
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "uuid": "employee-uuid-123",
      "full_name": "John Doe",
      "nik": "1234567890",
      "nip": "20260227001",
      "employeeDocuments": [        // ← NEW: All employee documents
        {
          "uuid": "doc-uuid-1",
          "filename": "KTP.pdf",
          "file": "employee_documents/xyz789.pdf",
          "created_at": "2026-02-27T10:00:00.000000Z"
        }
      ]
    },
    "documents": [                  // ← NEW: Just uploaded documents
      {
        "uuid": "doc-uuid-1",
        "filename": "KTP.pdf",
        "file": "employee_documents/xyz789.pdf"
      }
    ]
  }
}
```

---

### 2. Update Employee API
**Endpoint:** `PATCH /api/employees/{uuid}`

#### ✅ Update with Documents
```javascript
// Option 1: With File Upload (use FormData)
const formData = new FormData();
formData.append('full_name', 'John Doe Updated');
formData.append('_method', 'PATCH'); // Laravel method spoofing

if (newFiles.length > 0) {
  newFiles.forEach(file => {
    formData.append('documents[]', file);
  });
}

const response = await fetch(`/api/employees/${uuid}`, {
  method: 'POST',              // ⚠️ Must use POST with _method
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// Option 2: Without File Upload (use JSON as usual)
const response = await fetch(`/api/employees/${uuid}`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    full_name: 'John Doe Updated'
  })
});
```

#### 📤 Response
```javascript
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employee": {
      "uuid": "employee-uuid-123",
      "full_name": "John Doe Updated",
      "employeeDocuments": [        // All documents including new ones
        {
          "uuid": "doc-uuid-1",
          "filename": "KTP.pdf",
          "file": "employee_documents/xyz789.pdf"
        },
        {
          "uuid": "doc-uuid-2",
          "filename": "NPWP.pdf",
          "file": "employee_documents/abc456.pdf"
        }
      ]
    },
    "documents": [                  // Only newly uploaded documents
      {
        "uuid": "doc-uuid-2",
        "filename": "NPWP.pdf",
        "file": "employee_documents/abc456.pdf"
      }
    ]
  }
}
```

---

## 🆕 New API Endpoints

### 3. Preview Document
**Endpoint:** `GET /api/employees/{employeeId}/documents/{documentUuid}/preview`

Get document URL and metadata for preview.

```javascript
async function previewDocument(employeeId, documentUuid) {
  const response = await fetch(
    `/api/employees/${employeeId}/documents/${documentUuid}/preview`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  // Response
  // {
  //   "success": true,
  //   "data": {
  //     "uuid": "doc-uuid-1",
  //     "filename": "KTP.pdf",
  //     "url": "http://localhost/storage/employee_documents/xyz789.pdf",
  //     "path": "employee_documents/xyz789.pdf",
  //     "size": 245120,              // in bytes
  //     "mime_type": "application/pdf"
  //   }
  // }
  
  return data.data;
}

// Usage: Open in new tab
const doc = await previewDocument(employeeId, docUuid);
window.open(doc.url, '_blank');

// Usage: Embed in iframe (for PDF)
const doc = await previewDocument(employeeId, docUuid);
document.getElementById('pdfViewer').src = doc.url;

// Usage: Display image
const doc = await previewDocument(employeeId, docUuid);
document.getElementById('imagePreview').src = doc.url;
```

---

### 4. Download Document
**Endpoint:** `GET /api/employees/{employeeId}/documents/{documentUuid}/download`

Download document file directly.

```javascript
async function downloadDocument(employeeId, documentUuid, filename) {
  const response = await fetch(
    `/api/employees/${employeeId}/documents/${documentUuid}/download`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  // Convert response to blob
  const blob = await response.blob();
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Usage
downloadDocument('employee-uuid-123', 'doc-uuid-1', 'KTP.pdf');
```

---

### 5. Delete Document
**Endpoint:** `DELETE /api/employees/{employeeId}/documents/{documentUuid}`

Delete a document (soft delete).

```javascript
async function deleteDocument(employeeId, documentUuid) {
  if (!confirm('Are you sure you want to delete this document?')) {
    return;
  }
  
  const response = await fetch(
    `/api/employees/${employeeId}/documents/${documentUuid}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  
  // Response
  // {
  //   "success": true,
  //   "message": "Document deleted successfully"
  // }
  
  if (data.success) {
    alert('Document deleted successfully');
    // Refresh the document list
  }
}

// Usage
deleteDocument('employee-uuid-123', 'doc-uuid-1');
```

---

## 🎨 Complete UI Component Examples

### React/Next.js Implementation

#### Employee Form with File Upload
```jsx
import { useState } from 'react';

function EmployeeForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: '',
    nik: '',
    nip: ''
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: Invalid file type. Only PDF, JPG, PNG, DOC, DOCX allowed.`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`${file.name}: File too large. Max 5MB.`);
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(validFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = new FormData();
      data.append('full_name', formData.full_name);
      data.append('nik', formData.nik);
      data.append('nip', formData.nip);
      
      selectedFiles.forEach(file => {
        data.append('documents[]', file);
      });
      
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Employee created successfully!');
        if (onSuccess) onSuccess(result.data);
      } else {
        setError(result.message || 'Failed to create employee');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Full Name *</label>
        <input
          type="text"
          required
          value={formData.full_name}
          onChange={e => setFormData({...formData, full_name: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">NIK *</label>
        <input
          type="text"
          required
          value={formData.nik}
          onChange={e => setFormData({...formData, nik: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">NIP (Optional)</label>
        <input
          type="text"
          value={formData.nip}
          onChange={e => setFormData({...formData, nip: e.target.value})}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Documents (Optional)</label>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border rounded"
        />
        <p className="text-xs text-gray-500 mt-1">
          Max 5MB per file. Allowed: PDF, JPG, PNG, DOC, DOCX
        </p>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="border rounded p-3">
          <h4 className="font-medium mb-2">Selected Files ({selectedFiles.length}):</h4>
          <ul className="space-y-1">
            {selectedFiles.map((file, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm">
                <span className="truncate">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-red-600 hover:text-red-800 ml-2"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Creating...' : 'Create Employee'}
      </button>
    </form>
  );
}

export default EmployeeForm;
```

#### Document List Component
```jsx
import { useState } from 'react';

function DocumentList({ employeeId, documents, onDocumentDeleted }) {
  const [loading, setLoading] = useState({});

  const previewDocument = async (docUuid) => {
    try {
      setLoading(prev => ({ ...prev, [docUuid]: 'preview' }));
      
      const response = await fetch(
        `/api/employees/${employeeId}/documents/${docUuid}/preview`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        // Open in new tab
        window.open(data.data.url, '_blank');
      } else {
        alert('Failed to preview document');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, [docUuid]: null }));
    }
  };

  const downloadDocument = async (docUuid, filename) => {
    try {
      setLoading(prev => ({ ...prev, [docUuid]: 'download' }));
      
      const response = await fetch(
        `/api/employees/${employeeId}/documents/${docUuid}/download`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, [docUuid]: null }));
    }
  };

  const deleteDocument = async (docUuid, filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, [docUuid]: 'delete' }));
      
      const response = await fetch(
        `/api/employees/${employeeId}/documents/${docUuid}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        alert('Document deleted successfully');
        if (onDocumentDeleted) onDocumentDeleted(docUuid);
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, [docUuid]: null }));
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No documents uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Documents ({documents.length})</h3>
      
      {documents.map(doc => (
        <div
          key={doc.uuid}
          className="border rounded p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex-1">
            <h4 className="font-medium">{doc.filename}</h4>
            <p className="text-xs text-gray-500">
              Uploaded: {new Date(doc.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => previewDocument(doc.uuid)}
              disabled={loading[doc.uuid]}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading[doc.uuid] === 'preview' ? '...' : '👁️ Preview'}
            </button>
            
            <button
              onClick={() => downloadDocument(doc.uuid, doc.filename)}
              disabled={loading[doc.uuid]}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading[doc.uuid] === 'download' ? '...' : '📥 Download'}
            </button>
            
            <button
              onClick={() => deleteDocument(doc.uuid, doc.filename)}
              disabled={loading[doc.uuid]}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
            >
              {loading[doc.uuid] === 'delete' ? '...' : '🗑️ Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DocumentList;
```

#### Document Preview Modal
```jsx
import { useState, useEffect } from 'react';

function DocumentPreviewModal({ employeeId, documentUuid, onClose }) {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocumentPreview();
  }, [documentUuid]);

  const fetchDocumentPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/employees/${employeeId}/documents/${documentUuid}/preview`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setDocData(data.data);
      } else {
        setError('Failed to load preview');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded max-w-md">
          <h3 className="text-red-600 font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isPDF = docData.mime_type === 'application/pdf';
  const isImage = docData.mime_type.startsWith('image/');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">{docData.filename}</h3>
            <p className="text-sm text-gray-500">
              {(docData.size / 1024).toFixed(2)} KB • {docData.mime_type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            ✕
          </button>
        </div>
        
        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4">
          {isPDF && (
            <iframe
              src={docData.url}
              className="w-full h-full min-h-[600px]"
              title={docData.filename}
            />
          )}
          
          {isImage && (
            <img
              src={docData.url}
              alt={docData.filename}
              className="max-w-full h-auto mx-auto"
            />
          )}
          
          {!isPDF && !isImage && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Preview not available for this file type
              </p>
              <a
                href={docData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Open in New Tab
              </a>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <a
            href={docData.url}
            download={docData.filename}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModal;
```

---

## 📋 Validation Rules

### File Upload Validation
- **Allowed MIME types:**
  - `application/pdf` (PDF)
  - `image/jpeg`, `image/jpg` (JPG/JPEG)
  - `image/png` (PNG)
  - `application/msword` (DOC)
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
- **Max file size:** 5MB (5120 KB) per file
- **Multiple files:** Supported via `documents[]` array

### Frontend Validation Example
```javascript
function validateFile(file) {
  const validTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF, JPG, PNG, DOC, DOCX are allowed.'
    };
  }
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }
  
  return { valid: true };
}

// Usage
const result = validateFile(file);
if (!result.valid) {
  alert(result.error);
}
```

---

## 🔐 Authorization

All new document endpoints require authentication via JWT token in Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📊 API Summary Table

| Method | Endpoint | Purpose | Body Type |
|--------|----------|---------|-----------|
| POST | `/api/employees` | Create employee with documents | `FormData` |
| PATCH | `/api/employees/{uuid}` | Update employee + add documents | `FormData` / `JSON` |
| GET | `/api/employees/{id}/documents/{uuid}/preview` | Get document URL & metadata | - |
| GET | `/api/employees/{id}/documents/{uuid}/download` | Download document file | - |
| DELETE | `/api/employees/{id}/documents/{uuid}` | Delete document | - |

---

## 🚀 Migration Checklist

- [ ] Update create employee form to use `FormData` instead of JSON
- [ ] Add file input field for document uploads
- [ ] Implement file validation on frontend
- [ ] Update state management to handle `employeeDocuments` array
- [ ] Create document list component
- [ ] Implement preview functionality
- [ ] Implement download functionality
- [ ] Implement delete functionality with confirmation
- [ ] Update update employee form to support document uploads
- [ ] Test with multiple file uploads
- [ ] Handle error cases (file too large, invalid type, etc.)
- [ ] Add loading states for document operations
- [ ] Test document preview for different file types (PDF, images)

---

## 💡 Tips & Best Practices

1. **FormData vs JSON:**
   - Use `FormData` when uploading files
   - Can still use `JSON` for updates without files
   
2. **Content-Type Header:**
   - DO NOT set `Content-Type` header when using `FormData`
   - Browser will automatically set it with proper `multipart/form-data` boundary

3. **Laravel Method Spoofing:**
   - When using `FormData` with PATCH/PUT, use POST with `_method` field:
   ```javascript
   formData.append('_method', 'PATCH');
   fetch(url, { method: 'POST', body: formData });
   ```

4. **File Preview:**
   - Use iframe for PDF files
   - Use `<img>` tag for images
   - Provide download link for other file types

5. **Error Handling:**
   - Always validate files before upload
   - Show user-friendly error messages
   - Handle network errors gracefully

6. **UX Improvements:**
   - Show upload progress (using `XMLHttpRequest` or `axios`)
   - Display file preview thumbnails
   - Add drag-and-drop file upload
   - Show file size and type before upload

---

## 📞 Support

For questions or issues, please contact the backend development team.

Last updated: February 27, 2026
