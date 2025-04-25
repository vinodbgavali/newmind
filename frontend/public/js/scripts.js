const USERS_API = 'http://localhost:3001/api/users';
const HIERARCHY_API = 'http://localhost:3002/api';
const VERSIONS_API = 'http://localhost:3003/api';

// Helper to show alerts
function showAlert(elementId, message, type = 'danger') {
  const alertDiv = document.getElementById(elementId);
  alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => alertDiv.innerHTML = '', 5000);
}

// Register
async function register(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const body = Object.fromEntries(data);

  try {
    const response = await axios.post(`${USERS_API}/register`, body);
    window.location.href = '/login';
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Registration failed');
  }
}

// Login
async function login(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const body = Object.fromEntries(data);

  try {
    await axios.post(`${USERS_API}/login`, body, { withCredentials: true });
    window.location.href = '/dashboard';
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Login failed');
  }
}

// Logout
async function logout() {
  try {
    await axios.post(`${USERS_API}/logout`, {}, { withCredentials: true });
    window.location.href = '/login';
  } catch (error) {
    showAlert('alert', 'Logout failed');
  }
}

// Load dashboard
async function loadDashboard() {
  try {
    const [foldersResponse, totalResponse] = await Promise.all([
      axios.get(`${HIERARCHY_API}/viewstore`, { withCredentials: true }),
      axios.get(`${HIERARCHY_API}/total-documents`, { withCredentials: true })
    ]);
    const folders = foldersResponse.data.data;
    const totalDocuments = totalResponse.data.data.totalDocuments;

    const folderList = document.getElementById('folder-list');
    folderList.innerHTML = folders.map(folder => `
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${folder.name}</h5>
            <a href="/folder/${folder.id}" class="btn btn-primary">View</a>
            <button class="btn btn-warning" onclick="editFolder(${folder.id}, '${folder.name}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteFolder(${folder.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    document.getElementById('total-documents').innerText = totalDocuments;
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to load dashboard');
  }
}

// Load folder
async function loadFolder(folderId) {
  try {
    const response = await axios.get(`${HIERARCHY_API}/viewstore/${folderId}`, { withCredentials: true });
    const { folder, subfolders, documents } = response.data.data;

    const folderList = document.getElementById('subfolder-list');
    folderList.innerHTML = subfolders.map(subfolder => `
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${subfolder.name}</h5>
            <a href="/folder/${subfolder.id}" class="btn btn-primary">View</a>
            <button class="btn btn-warning" onclick="editFolder(${subfolder.id}, '${subfolder.name}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteFolder(${subfolder.id})">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    const documentList = document.getElementById('document-list');
    documentList.innerHTML = documents.map(doc => `
      <tr>
        <td>${doc.title}</td>
        <td>${new Date(doc.createdAt).toLocaleDateString()}</td>
        <td>
          <a href="/document/${doc.id}" class="btn btn-primary btn-sm">View</a>
          <button class="btn btn-warning btn-sm" onclick="editDocument(${doc.id}, '${doc.title}', '${doc.content}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteDocument(${doc.id})">Delete</button>
        </td>
      </tr>
    `).join('');

    document.getElementById('folder-name').innerText = folder.name;
    document.getElementById('create-folder-form').dataset.parentFolder = folderId;
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to load folder');
  }
}

// Load document
async function loadDocument(documentId) {
  try {
    const [docResponse, versionsResponse] = await Promise.all([
      axios.get(`${HIERARCHY_API}/documents/${documentId}`, { withCredentials: true }),
      axios.get(`${VERSIONS_API}/documents/${documentId}/versions`, { withCredentials: true })
    ]);
    const document = docResponse.data.data;
    const versions = versionsResponse.data.data;

    document.getElementById('document-title').innerText = document.title;
    document.getElementById('document-content').innerText = document.content || 'No content';
    document.getElementById('document-created').innerText = new Date(document.createdAt).toLocaleDateString();

    const versionList = document.getElementById('version-list');
    versionList.innerHTML = versions.map(version => `
      <tr>
        <td>${version.version}</td>
        <td><a href="${version.fileUrl}" target="_blank">${version.fileUrl}</a></td>
        <td>${new Date(version.uploadedAt).toLocaleDateString()}</td>
      </tr>
    `).join('');

    document.getElementById('edit-document-form').dataset.documentId = documentId;
    document.getElementById('create-version-form').dataset.documentId = documentId;
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to load document');
  }
}

// Create folder
async function createFolder(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const parentFolder = form.dataset.parentFolder;

  try {
    await axios.post(`${HIERARCHY_API}/folders`, { name: data.get('name'), parentFolder }, { withCredentials: true });
    window.location.reload();
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to create folder');
  }
}

// Edit folder
async function editFolder(id, name) {
  document.getElementById('edit-folder-id').value = id;
  document.getElementById('edit-folder-name').value = name;
  new bootstrap.Modal(document.getElementById('editFolderModal')).show();
}

async function updateFolder(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.dataset.folderId;
  const data = new FormData(form);

  try {
    await axios.put(`${HIERARCHY_API}/folders/${id}`, { name: data.get('name') }, { withCredentials: true });
    window.location.reload();
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to update folder');
  }
}

// Delete folder
async function deleteFolder(id) {
  if (!confirm('Are you sure you want to delete this folder and its contents?')) return;
  try {
    await axios.delete(`${HIERARCHY_API}/folders/${id}`, { withCredentials: true });
    window.location.reload();
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to delete folder');
  }
}

// Create document
async function createDocument(event) {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);

  try {
    await axios.post(`${HIERARCHY_API}/documents`, data, { withCredentials: true });
    window.location.reload();
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to create document');
  }
}

// Edit document
async function editDocument(id, title, content) {
  document.getElementById('edit-document-id').value = id;
  document.getElementById('edit-document-title').value = title;
  document.getElementById('edit-document-content').value = content || '';
  new bootstrap.Modal(document.getElementById('editDocumentModal')).show();
}

async function updateDocument(event) {
  event.preventDefault();
  const form = event.target;
  const id = form.dataset.documentId;
  const data = new FormData(form);

  try {
    await axios.put(`${HIERARCHY_API}/documents/${id}`, {
      title: data.get('title'),
      content: data.get('content'),
    }, { withCredentials: true });
    window.location.reload();
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to update document');
  }
}

// Delete document
async function deleteDocument(id) {
  if (!confirm('Are you sure you want to delete this document and its versions?')) return;
  try {
    await axios.delete(`${HIERARCHY_API}/documents/${id}`, { withCredentials: true });
    window.location.reload();
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to delete document');
  }
}

// Create version
async function createVersion(event) {
  event.preventDefault();
  const form = event.target;
  const documentId = form.dataset.documentId;
  const data = new FormData(form);

  try {
    await axios.post(`${VERSIONS_API}/documents/${documentId}/version`, data, { withCredentials: true });
    window.location.reload();
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to create version');
  }
}

// Filter documents
async function filterDocuments(event) {
  event.preventDefault();
  const search = document.getElementById('search-input').value;

  try {
    const response = await axios.get(`${HIERARCHY_API}/filter?search=${search}`, { withCredentials: true });
    const documents = response.data.data;

    const documentList = document.getElementById('document-list');
    documentList.innerHTML = documents.map(doc => `
      <tr>
        <td>${doc.title}</td>
        <td>${doc.folderPath}</td>
        <td><a href="/document/${doc.id}" class="btn btn-primary btn-sm">View</a></td>
      </tr>
    `).join('');
  } catch (error) {
    showAlert('alert', error.response?.data?.message || 'Failed to filter documents');
  }
}