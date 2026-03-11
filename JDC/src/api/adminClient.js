let adminCsrfToken = '';

function updateCsrfToken(data) {
  if (data && typeof data === 'object' && typeof data.csrf_token === 'string' && data.csrf_token !== '') {
    adminCsrfToken = data.csrf_token;
  }
}

async function request(action, options = {}) {
  const method = options.method || 'GET';
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`/api/index.php?action=${encodeURIComponent(action)}`, {
    method,
    headers: isFormData
      ? {
          ...(method !== 'GET' && adminCsrfToken ? { 'X-CSRF-Token': adminCsrfToken } : {}),
          ...(options.headers || {}),
        }
      : {
          'Content-Type': 'application/json',
          ...(method !== 'GET' && adminCsrfToken ? { 'X-CSRF-Token': adminCsrfToken } : {}),
          ...(options.headers || {}),
        },
    body: options.body
      ? (isFormData ? options.body : JSON.stringify(options.body))
      : undefined,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'Erreur API');
  }

  updateCsrfToken(data.data);
  return data.data;
}

async function requestWithQuery(action, params = {}) {
  const searchParams = new URLSearchParams({ action });

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    searchParams.set(key, String(value));
  });

  const response = await fetch(`/api/index.php?${searchParams.toString()}`);
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'Erreur API');
  }

  updateCsrfToken(data.data);
  return data.data;
}

export function getAdminSession() {
  return request('admin_session');
}

export function adminLogin(username, password) {
  return request('admin_login', {
    method: 'POST',
    body: { username, password },
  });
}

export function adminLogout() {
  return request('admin_logout', {
    method: 'POST',
    body: {},
  });
}

export function getCarteGrisePricing() {
  return request('carte_grise_pricing');
}

export function getCarteGriseContent() {
  return request('carte_grise_content');
}

export function saveCarteGrisePricing(items) {
  return request('admin_carte_grise_pricing', {
    method: 'POST',
    body: { items },
  });
}

export function saveCarteGriseContent(content) {
  return request('admin_carte_grise_content', {
    method: 'POST',
    body: { content },
  });
}

export function uploadCarteGriseFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  return request('admin_upload_carte_grise_file', {
    method: 'POST',
    body: formData,
  });
}

export function getAdminVehicles({
  status = 'all',
  q = '',
  brand = '',
  model = '',
  year = '',
  sort = 'updated_desc',
  page = 1,
  perPage = 24,
} = {}) {
  return requestWithQuery('admin_vehicles', {
    status,
    q,
    brand,
    model,
    year,
    sort,
    page,
    per_page: perPage,
  });
}

export function updateAdminVehicleStatus(vehicleId, status) {
  return request('admin_vehicle_status', {
    method: 'POST',
    body: {
      vehicle_id: vehicleId,
      status,
    },
  });
}

export function getAdminActivity({ targetType = '', limit = 20 } = {}) {
  return requestWithQuery('admin_activity', {
    target_type: targetType,
    limit,
  });
}
