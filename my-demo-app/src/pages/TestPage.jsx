import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Server, Database, Send, RefreshCw, AlertCircle, LogOut, LogIn } from 'lucide-react';
import {
  testBackendHealth,
  testApiEndpoint,
  testLoginUser,
  testRegisterUser,
  testGetCurrentUser,
  testGetClinics,
  testGetClinic,
  testListBookings,
  testSupabaseConnection,
  testSupabaseAuth,
  testSupabaseQuery,
  testCORS,
  testBackendDiagnostic,
  testLogout,
  getAuthToken,
  BACKEND_URL,
} from '../utils/testApi';
import '../styles/test.css';

const TestPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    auth: true,
    backend: false,
    clinics: false,
    bookings: false,
    supabase: false,
  });
  const [activeTab, setActiveTab] = useState('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  // Auth form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Custom endpoint
  const [customEndpoint, setCustomEndpoint] = useState('/clinics');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customBody, setCustomBody] = useState('');

  // Clinic/Booking testing
  const [clinicId, setClinicId] = useState('');
  const [therapistId, setTherapistId] = useState('');
  const [bookingDate, setBookingDate] = useState('');

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

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      alert('Please enter email and password');
      return;
    }
    await runTest('login', () => testLoginUser(loginEmail, loginPassword));
    setIsAuthenticated(true);
  };

  const handleRegister = async () => {
    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
      alert('Please fill all fields');
      return;
    }
    await runTest('register', () => testRegisterUser(regFirstName, regLastName, regEmail, regPassword));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    const result = testLogout();
    setResults(prev => ({
      ...prev,
      logout: { ...result, timestamp: new Date().toLocaleTimeString() },
    }));
    setIsAuthenticated(false);
  };

  const handleGetCurrentUser = async () => {
    await runTest('currentUser', testGetCurrentUser);
  };

  const handleGetClinics = async () => {
    await runTest('clinics', testGetClinics);
  };

  const handleGetClinic = async () => {
    if (!clinicId) {
      alert('Please enter a clinic ID');
      return;
    }
    await runTest(`clinic_${clinicId}`, () => testGetClinic(clinicId));
  };

  const handleListBookings = async () => {
    await runTest('listBookings', testListBookings);
  };

  const handleCustomEndpoint = async () => {
    if (!customEndpoint) {
      alert('Please enter an endpoint');
      return;
    }
    const testFunc = () => testApiEndpoint(customEndpoint, customMethod, customBody ? JSON.parse(customBody) : null);
    await runTest(`custom_${customEndpoint}`, testFunc);
  };

  const handleBackendHealth = async () => {
    await runTest('backendHealth', testBackendHealth);
  };

  const handleCORS = async () => {
    await runTest('cors', testCORS);
  };

  const handleDiagnostic = async () => {
    await runTest('diagnostic', testBackendDiagnostic);
  };

  const handleSupabaseConnection = async () => {
    await runTest('supabaseConnection', testSupabaseConnection);
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
        <h1>🧪 Physiobook API Test Dashboard</h1>
        <p>Test your Render backend and Supabase database</p>
        <div className="auth-status">
          {isAuthenticated ? (
            <>
              <span className="status-badge authenticated">✓ Authenticated</span>
              <button onClick={handleLogout} className="logout-btn">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <span className="status-badge">Not Authenticated</span>
          )}
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          🔐 Auth
        </button>
        <button
          className={`tab ${activeTab === 'backend' ? 'active' : ''}`}
          onClick={() => setActiveTab('backend')}
        >
          🏥 Backend
        </button>
        <button
          className={`tab ${activeTab === 'clinics' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinics')}
        >
          🏢 Clinics
        </button>
        <button
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings
        </button>
        <button
          className={`tab ${activeTab === 'supabase' ? 'active' : ''}`}
          onClick={() => setActiveTab('supabase')}
        >
          🗄️ Supabase
        </button>
      </div>

      <div className="test-content">
        {/* AUTH TAB */}
        {activeTab === 'auth' && (
          <>
            <section className="test-section">
              <h2>Login</h2>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input"
                />
                <button
                  onClick={handleLogin}
                  disabled={loading.login}
                  className="test-button primary"
                >
                  {loading.login ? 'Logging in...' : <><LogIn size={16} /> Login</>}
                </button>
              </div>
              <ResultBox name="Login" data={results.login} />
            </section>

            <section className="test-section">
              <h2>Register New User</h2>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="First Name"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="input"
                />
                <input
                  type="password"
                  placeholder="Password (min 8 chars, uppercase, lowercase, number)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="input"
                />
                <button
                  onClick={handleRegister}
                  disabled={loading.register}
                  className="test-button primary"
                >
                  {loading.register ? 'Registering...' : '📝 Register'}
                </button>
              </div>
              <ResultBox name="Register" data={results.register} />
            </section>

            <section className="test-section">
              <h2>Get Current User</h2>
              <button
                onClick={handleGetCurrentUser}
                disabled={loading.currentUser}
                className="test-button primary"
              >
                {loading.currentUser ? 'Loading...' : '👤 Get My Profile'}
              </button>
              <ResultBox name="Current User" data={results.currentUser} />
            </section>
          </>
        )}

        {/* BACKEND TAB */}
        {activeTab === 'backend' && (
          <>
            <section className="test-section">
              <div className="backend-url">
                <strong>Backend URL:</strong> <code>{BACKEND_URL}</code>
              </div>

              <div className="button-group">
                <button
                  onClick={handleBackendHealth}
                  disabled={loading.backendHealth}
                  className="test-button primary"
                >
                  {loading.backendHealth ? 'Testing...' : '🏥 Test Backend Health'}
                </button>
                <button
                  onClick={handleCORS}
                  disabled={loading.cors}
                  className="test-button primary"
                >
                  {loading.cors ? 'Testing...' : '🔗 Test CORS'}
                </button>
                <button
                  onClick={handleDiagnostic}
                  disabled={loading.diagnostic}
                  className="test-button danger"
                >
                  {loading.diagnostic ? 'Running...' : <><AlertCircle size={16} /> Full Diagnostic</>}
                </button>
              </div>

              <ResultBox name="Backend Health" data={results.backendHealth} />
              <ResultBox name="CORS Test" data={results.cors} />
              <ResultBox name="Diagnostic Report" data={results.diagnostic} />
            </section>

            <section className="test-section">
              <h2>Custom Endpoint Testing</h2>
              <div className="form-group">
                <div className="input-row">
                  <select value={customMethod} onChange={(e) => setCustomMethod(e.target.value)} className="input">
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                  </select>
                  <input
                    type="text"
                    placeholder="/clinics, /bookings, /users/me, etc."
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    className="input"
                  />
                </div>
                <textarea
                  placeholder='Optional JSON body: {"key": "value"}'
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="input"
                />
                <button
                  onClick={handleCustomEndpoint}
                  disabled={loading[`custom_${customEndpoint}`]}
                  className="test-button primary"
                >
                  {loading[`custom_${customEndpoint}`] ? 'Testing...' : <><Send size={16} /> Test Endpoint</>}
                </button>
              </div>
              <ResultBox name={`${customMethod} ${customEndpoint}`} data={results[`custom_${customEndpoint}`]} />
            </section>
          </>
        )}

        {/* CLINICS TAB */}
        {activeTab === 'clinics' && (
          <>
            <section className="test-section">
              <h2>List All Clinics</h2>
              <button
                onClick={handleGetClinics}
                disabled={loading.clinics}
                className="test-button primary"
              >
                {loading.clinics ? 'Loading...' : '🏢 Get All Clinics'}
              </button>
              <ResultBox name="List Clinics" data={results.clinics} />
            </section>

            <section className="test-section">
              <h2>Get Clinic Details</h2>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Clinic ID (UUID)"
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                  className="input"
                />
                <button
                  onClick={handleGetClinic}
                  disabled={loading[`clinic_${clinicId}`]}
                  className="test-button primary"
                >
                  {loading[`clinic_${clinicId}`] ? 'Loading...' : '🔍 Get Clinic'}
                </button>
              </div>
              <ResultBox name={`Clinic: ${clinicId}`} data={results[`clinic_${clinicId}`]} />
            </section>
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <>
            <section className="test-section">
              <h2>List My Bookings</h2>
              <button
                onClick={handleListBookings}
                disabled={loading.listBookings}
                className="test-button primary"
              >
                {loading.listBookings ? 'Loading...' : '📅 Get My Bookings'}
              </button>
              <ResultBox name="My Bookings" data={results.listBookings} />
            </section>
          </>
        )}

        {/* SUPABASE TAB */}
        {activeTab === 'supabase' && (
          <>
            <section className="test-section">
              <div className="warning-box">
                <strong>⚠️ Configure Supabase:</strong>
                <pre>VITE_SUPABASE_URL=your_url{'\n'}VITE_SUPABASE_ANON_KEY=your_key</pre>
              </div>

              <button
                onClick={handleSupabaseConnection}
                disabled={loading.supabaseConnection}
                className="test-button primary"
              >
                {loading.supabaseConnection ? 'Testing...' : '🔌 Test Supabase Connection'}
              </button>
              <ResultBox name="Supabase Connection" data={results.supabaseConnection} />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default TestPage;
