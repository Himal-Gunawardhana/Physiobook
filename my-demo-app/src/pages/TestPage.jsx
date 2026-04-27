import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Server, Database, Send, RefreshCw, AlertCircle } from 'lucide-react';
import {
  testBackendHealth,
  testApiEndpoint,
  testSupabaseConnection,
  testSupabaseAuth,
  testSupabaseQuery,
  testCORS,
  testBackendDiagnostic,
  BACKEND_URL,
} from '../utils/testApi';
import '../styles/test.css';

const TestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    backend: true,
    supabase: true,
  });
  const [customEndpoint, setCustomEndpoint] = useState('/api/health');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customBody, setCustomBody] = useState('');
  const [tableName, setTableName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const runTest = async (testName, testFunc) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFunc();
      setResults(prev => ({
        ...prev,
        [testName]: { ...result, timestamp: new Date().toLocaleTimeString() },
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message, timestamp: new Date().toLocaleTimeString() },
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const handleBackendTest = async () => {
    await runTest('backendHealth', testBackendHealth);
  };

  const handleCORSTest = async () => {
    await runTest('cors', testCORS);
  };

  const handleDiagnosticTest = async () => {
    await runTest('diagnostic', testBackendDiagnostic);
  };

  const handleSupabaseConnectionTest = async () => {
    await runTest('supabaseConnection', testSupabaseConnection);
  };

  const handleCustomEndpointTest = async () => {
    if (!customEndpoint.trim()) {
      alert('Please enter an endpoint');
      return;
    }
    const testFunc = () => testApiEndpoint(customEndpoint, customMethod, customBody ? JSON.parse(customBody) : null);
    await runTest(`endpoint_${customEndpoint}`, testFunc);
  };

  const handleSupabaseTableTest = async () => {
    if (!tableName.trim()) {
      alert('Please enter a table name');
      return;
    }
    const testFunc = () => testSupabaseQuery(tableName);
    await runTest(`table_${tableName}`, testFunc);
  };

  const handleSupabaseAuthTest = async () => {
    if (!authEmail || !authPassword) {
      alert('Please enter email and password');
      return;
    }
    const testFunc = () => testSupabaseAuth(authEmail, authPassword);
    await runTest('supabaseAuth', testFunc);
  };

  const ResultBox = ({ name, data }) => {
    if (!data) return null;

    return (
      <div className={`result-box ${data.success ? 'success' : 'error'}`}>
        <div className="result-header">
          <span className="result-name">{name}</span>
          <span className="result-status">{data.success ? '✓' : '✗'}</span>
        </div>
        <div className="result-time">{data.timestamp}</div>
        {data.message && <div className="result-message">{data.message}</div>}
        {data.status && <div className="result-status-code">Status: {data.status}</div>}
        {data.error && <div className="result-error">Error: {data.error}</div>}
        {data.data && (
          <details className="result-details">
            <summary>Response Data</summary>
            <pre>{JSON.stringify(data.data, null, 2)}</pre>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="test-page-container">
      <header className="test-header">
        <h1>🧪 API & Database Test Dashboard</h1>
        <p>Test your Render backend and Supabase database connectivity</p>
      </header>

      <div className="test-content">
        {/* Backend Tests */}
        <section className="test-section">
          <div className="section-header" onClick={() => toggleSection('backend')}>
            <div className="section-title">
              <Server size={20} />
              <h2>Backend Tests</h2>
            </div>
            {expandedSections.backend ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedSections.backend && (
            <div className="section-content">
              <div className="backend-url">
                <strong>Backend URL:</strong> <code>{BACKEND_URL}</code>
              </div>

              <div className="test-group">
                <button
                  onClick={handleBackendTest}
                  disabled={loading.backendHealth}
                  className="test-button primary"
                >
                  {loading.backendHealth ? 'Testing...' : '🏥 Test Backend Health'}
                </button>
                <ResultBox name="Backend Health" data={results.backendHealth} />
              </div>

              <div className="test-group">
                <button
                  onClick={handleCORSTest}
                  disabled={loading.cors}
                  className="test-button primary"
                >
                  {loading.cors ? 'Testing...' : '🔗 Test CORS'}
                </button>
                <ResultBox name="CORS Test" data={results.cors} />
              </div>

              <div className="test-group">
                <button
                  onClick={handleDiagnosticTest}
                  disabled={loading.diagnostic}
                  className="test-button primary"
                  style={{ backgroundColor: '#ff6b6b' }}
                >
                  {loading.diagnostic ? 'Running Diagnostic...' : <><AlertCircle size={16} /> Run Full Diagnostic</>}
                </button>
                {results.diagnostic && (
                  <div className={`result-box ${results.diagnostic.success ? 'success' : 'error'}`}>
                    <div className="result-header">
                      <span className="result-name">Full Backend Diagnostic</span>
                    </div>
                    <details className="result-details">
                      <summary>View Complete Diagnostic Report</summary>
                      <pre>{JSON.stringify(results.diagnostic, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>

              <div className="test-group custom-endpoint">
                <div className="input-group">
                  <div>
                    <label>Custom Endpoint</label>
                    <input
                      type="text"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                      placeholder="/api/path"
                      className="input"
                    />
                  </div>
                  <div>
                    <label>Method</label>
                    <select value={customMethod} onChange={(e) => setCustomMethod(e.target.value)} className="input">
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label>Body (JSON)</label>
                  <textarea
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    className="input"
                  />
                </div>
                <button
                  onClick={handleCustomEndpointTest}
                  disabled={loading[`endpoint_${customEndpoint}`]}
                  className="test-button primary"
                >
                  {loading[`endpoint_${customEndpoint}`] ? 'Testing...' : <><Send size={16} /> Test Custom Endpoint</>}
                </button>
                <ResultBox name={`Custom: ${customMethod} ${customEndpoint}`} data={results[`endpoint_${customEndpoint}`]} />
              </div>
            </div>
          )}
        </section>

        {/* Supabase Tests */}
        <section className="test-section">
          <div className="section-header" onClick={() => toggleSection('supabase')}>
            <div className="section-title">
              <Database size={20} />
              <h2>Supabase Tests</h2>
            </div>
            {expandedSections.supabase ? <ChevronUp /> : <ChevronDown />}
          </div>

          {expandedSections.supabase && (
            <div className="section-content">
              <div className="warning-box">
                <strong>⚠️ Configuration Required:</strong> Add your Supabase credentials to <code>.env.local</code>:
                <pre>VITE_SUPABASE_URL=your_url{'\n'}VITE_SUPABASE_ANON_KEY=your_key</pre>
              </div>

              <div className="test-group">
                <button
                  onClick={handleSupabaseConnectionTest}
                  disabled={loading.supabaseConnection}
                  className="test-button primary"
                >
                  {loading.supabaseConnection ? 'Testing...' : '🔌 Test Supabase Connection'}
                </button>
                <ResultBox name="Supabase Connection" data={results.supabaseConnection} />
              </div>

              <div className="test-group">
                <div className="input-group">
                  <div>
                    <label>Email</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="test@example.com"
                      className="input"
                    />
                  </div>
                  <div>
                    <label>Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="password"
                      className="input"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSupabaseAuthTest}
                  disabled={loading.supabaseAuth}
                  className="test-button primary"
                >
                  {loading.supabaseAuth ? 'Testing...' : '🔐 Test Auth Login'}
                </button>
                <ResultBox name="Supabase Auth Test" data={results.supabaseAuth} />
              </div>

              <div className="test-group">
                <div className="input-group">
                  <div style={{ flex: 1 }}>
                    <label>Table Name</label>
                    <input
                      type="text"
                      value={tableName}
                      onChange={(e) => setTableName(e.target.value)}
                      placeholder="users"
                      className="input"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSupabaseTableTest}
                  disabled={loading[`table_${tableName}`]}
                  className="test-button primary"
                >
                  {loading[`table_${tableName}`] ? 'Testing...' : <><RefreshCw size={16} /> Query Table</>}
                </button>
                <ResultBox name={`Table: ${tableName}`} data={results[`table_${tableName}`]} />
              </div>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="test-section info-section">
          <h3>📋 Testing Instructions</h3>
          <ul>
            <li>Use <strong>Backend Tests</strong> to verify your Render backend is running and accessible</li>
            <li>Configure Supabase credentials in <code>.env.local</code> before running Supabase tests</li>
            <li>Test custom endpoints to verify specific API routes</li>
            <li>Use <strong>Query Table</strong> to test Supabase database access</li>
            <li>All requests are logged with timestamps for debugging</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TestPage;
