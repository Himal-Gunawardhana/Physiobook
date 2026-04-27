import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://physiobook-api-jvye.onrender.com';

// Store auth token in memory
let authToken = localStorage.getItem('physiobook_auth_token') || null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('physiobook_auth_token', token);
  } else {
    localStorage.removeItem('physiobook_auth_token');
  }
};

export const getAuthToken = () => authToken;

// Test backend connectivity
export const testBackendHealth = async () => {
  try {
    // Test with a simple GET to any endpoint
    const response = await fetch(`${BACKEND_URL}/api/clinics`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: response.statusText || 'No JSON response' };
    }
    
    return {
      success: response.ok || response.status === 401, // 401 means backend is working, just needs auth
      status: response.status,
      data,
      message: response.status === 401 ? 'Backend is healthy (authentication required)' : (response.ok ? 'Backend is healthy' : `Backend returned error (${response.status})`),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to connect to backend - Check if backend is running and CORS is enabled',
    };
  }
};

// Test generic API endpoint
export const testApiEndpoint = async (endpoint, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BACKEND_URL}/api${endpoint}`, options);
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: response.statusText || 'No JSON response' };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data,
      message: response.ok ? 'Success' : `Error (${response.status})`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Request failed - Check CORS and backend connectivity',
    };
  }
};

// Register a new user
export const testRegisterUser = async (firstName, lastName, email, password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Auto-login after registration
      if (data.accessToken) {
        setAuthToken(data.accessToken);
      }
    }

    return {
      success: response.ok,
      status: response.status,
      data,
      message: response.ok ? 'User registered successfully' : data.message || 'Registration failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Registration failed',
    };
  }
};

// Login user
export const testLoginUser = async (email, password) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.accessToken) {
      setAuthToken(data.accessToken);
    }

    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? { user: data.user, token: '***' } : data,
      message: response.ok ? 'Login successful' : data.message || 'Login failed',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Login failed',
    };
  }
};

// Get current user
export const testGetCurrentUser = async () => {
  if (!authToken) {
    return {
      success: false,
      message: 'Not authenticated - Please login first',
    };
  }

  return testApiEndpoint('/users/me', 'GET');
};

// Get all clinics
export const testGetClinics = async () => {
  return testApiEndpoint('/clinics', 'GET');
};

// Get clinic details
export const testGetClinic = async (clinicId) => {
  return testApiEndpoint(`/clinics/${clinicId}`, 'GET');
};

// Get available booking slots
export const testGetSlots = async (therapistId, date, duration = 60) => {
  return testApiEndpoint(`/bookings/slots?therapistId=${therapistId}&date=${date}&serviceDuration=${duration}`, 'GET');
};

// List bookings
export const testListBookings = async () => {
  return testApiEndpoint('/bookings', 'GET');
};

// Logout
export const testLogout = () => {
  setAuthToken(null);
  return {
    success: true,
    message: 'Logged out successfully',
  };
};

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    // Check if credentials are set
    if (!SUPABASE_URL || SUPABASE_URL.includes('your-project')) {
      return {
        success: false,
        message: 'Supabase credentials not configured',
        error: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY',
      };
    }

    // Try to fetch a simple query to verify connection
    const { data, error } = await supabase.from('information_schema.tables').select('*').limit(1);
    
    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to connect to Supabase',
      };
    }

    return {
      success: true,
      message: 'Supabase connection successful',
      data: { url: SUPABASE_URL },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Supabase connection error',
    };
  }
};

// Test Supabase auth
export const testSupabaseAuth = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        message: 'Auth test failed',
      };
    }

    return {
      success: true,
      message: 'Auth connection successful',
      data: { user: data.user?.email },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Auth test error',
    };
  }
};

// Test Supabase table query
export const testSupabaseQuery = async (tableName) => {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to query ${tableName}`,
      };
    }

    return {
      success: true,
      message: `Successfully queried ${tableName}`,
      data: { rowCount: count, sampleData: data },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Query error for ${tableName}`,
    };
  }
};

// Test CORS with OPTIONS request
export const testCORS = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/clinics`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'GET',
      },
    });

    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
    };

    return {
      success: response.ok || response.status === 204,
      status: response.status,
      headers: corsHeaders,
      message: (response.ok || response.status === 204) ? 'CORS enabled' : 'CORS may have issues',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'CORS test failed - Backend may not be reachable',
    };
  }
};

// Diagnostic test to check backend connectivity
export const testBackendDiagnostic = async () => {
  const diagnostics = {
    backendUrl: BACKEND_URL,
    authStatus: authToken ? 'Authenticated' : 'Not authenticated',
    timestamp: new Date().toISOString(),
    tests: {},
  };

  // Test 1: Basic connectivity
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(BACKEND_URL, { 
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    diagnostics.tests.basicConnectivity = { 
      success: true, 
      status: response.status,
      message: 'Backend is reachable' 
    };
  } catch (error) {
    diagnostics.tests.basicConnectivity = { 
      success: false, 
      error: error.message,
      message: 'Backend is not reachable - Check URL or if Render app is running' 
    };
  }

  // Test 2: Health endpoint
  diagnostics.tests.healthEndpoint = await testBackendHealth();

  // Test 3: CORS
  diagnostics.tests.cors = await testCORS();

  return diagnostics;
};

export { BACKEND_URL };
