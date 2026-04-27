import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://physiobook-api-jvye.onrender.com';

// Test backend connectivity
export const testBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
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
      message: response.ok ? 'Backend is healthy' : `Backend returned error (${response.status})`,
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
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
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
    const response = await fetch(`${BACKEND_URL}/api/health`, {
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
