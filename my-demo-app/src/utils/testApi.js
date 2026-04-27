import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const BACKEND_URL = 'https://physiobook-api-jvye.onrender.com';

// Test backend connectivity
export const testBackendHealth = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return {
      success: response.ok,
      status: response.status,
      data: await response.json(),
      message: response.ok ? 'Backend is healthy' : 'Backend returned error',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to connect to backend',
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
    const data = await response.json();
    return {
      success: response.ok,
      status: response.status,
      data,
      message: response.ok ? 'Success' : 'Error',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Request failed',
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

    return {
      success: response.ok,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      message: response.ok ? 'CORS enabled' : 'CORS issue',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'CORS test failed',
    };
  }
};

export { BACKEND_URL };
