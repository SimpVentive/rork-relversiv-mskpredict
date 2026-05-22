'use client';

import { useState, useEffect } from 'react';

// ===== TYPES =====

type AdminRole = 'system_admin' | 'hospital_admin' | 'analyst' | 'clinician' | 'viewer';

interface AdminSession {
  email: string;
  role: AdminRole;
  hospital: string | null;
  name: string;
}

interface Hospital {
  code: string;
  name: string;
  city: string;
  adminEmail: string;
  adminName: string;
  status: 'Active' | 'Suspended';
  backCount: number;
  shoulderCount: number;
  kneeCount: number;
}

interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  hospital: string | null;
  status: 'Active' | 'Inactive';
  permissions: string[];
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  hospital: string | null;
  status: 'Success' | 'Failed';
  details: string;
}

interface ValidationResult {
  totalRows: number;
  errors: number;
  warnings: string[];
  warningMessages: string[];
}

// ===== CONSTANTS =====

const MOCK_CREDENTIALS = [
  {
    email: 'mouli@metaloga.io',
    password: 'password',
    role: 'system_admin' as AdminRole,
    hospital: null,
    name: 'Mouli Sinha',
  },
  {
    email: 'rajesh@kims.in',
    password: 'kims123',
    role: 'hospital_admin' as AdminRole,
    hospital: 'KIMS',
    name: 'Rajesh Kumar',
  },
  {
    email: 'priya@aig.in',
    password: 'aig123',
    role: 'hospital_admin' as AdminRole,
    hospital: 'AIG',
    name: 'Priya Sharma',
  },
  {
    email: 'mohan@kues.in',
    password: 'kues123',
    role: 'hospital_admin' as AdminRole,
    hospital: 'KUES',
    name: 'Mohan Reddy',
  },
];

const MOCK_HOSPITALS: Hospital[] = [
  {
    code: 'KIMS',
    name: 'KIMS Hyderabad',
    city: 'Hyderabad',
    adminEmail: 'rajesh@kims.in',
    adminName: 'Rajesh Kumar',
    status: 'Active',
    backCount: 43,
    shoulderCount: 32,
    kneeCount: 38,
  },
  {
    code: 'AIG',
    name: 'AIG Gachibowli',
    city: 'Hyderabad',
    adminEmail: 'priya@aig.in',
    adminName: 'Priya Sharma',
    status: 'Active',
    backCount: 51,
    shoulderCount: 25,
    kneeCount: 22,
  },
  {
    code: 'ABHIS',
    name: 'Abhishek Hospital',
    city: 'Hyderabad',
    adminEmail: '',
    adminName: '',
    status: 'Suspended',
    backCount: 0,
    shoulderCount: 0,
    kneeCount: 0,
  },
  {
    code: 'KUES',
    name: 'KUES Hyderabad',
    city: 'Hyderabad',
    adminEmail: 'mohan@kues.in',
    adminName: 'Mohan Reddy',
    status: 'Active',
    backCount: 38,
    shoulderCount: 15,
    kneeCount: 21,
  },
  {
    code: 'SDD',
    name: 'SDD Lab',
    city: 'Bangalore',
    adminEmail: '',
    adminName: '',
    status: 'Suspended',
    backCount: 0,
    shoulderCount: 0,
    kneeCount: 0,
  },
];

const MOCK_USERS: AdminUser[] = [
  {
    id: 'user_1',
    email: 'mouli@metaloga.io',
    role: 'system_admin',
    hospital: null,
    status: 'Active',
    permissions: ['uploadData', 'manageHospitals', 'manageUsers', 'viewAuditLog', 'accessMasterData'],
  },
  {
    id: 'user_2',
    email: 'rajesh@kims.in',
    role: 'hospital_admin',
    hospital: 'KIMS',
    status: 'Active',
    permissions: ['uploadData', 'manageUsers'],
  },
  {
    id: 'user_3',
    email: 'priya@aig.in',
    role: 'hospital_admin',
    hospital: 'AIG',
    status: 'Active',
    permissions: ['uploadData', 'manageUsers'],
  },
  {
    id: 'user_4',
    email: 'analyst@kims.in',
    role: 'analyst',
    hospital: 'KIMS',
    status: 'Active',
    permissions: ['runAnalysis', 'viewPatients', 'downloadData'],
  },
  {
    id: 'user_5',
    email: 'doc@kims.in',
    role: 'clinician',
    hospital: 'KIMS',
    status: 'Inactive',
    permissions: ['viewPatients', 'viewRulesEngine'],
  },
  {
    id: 'user_6',
    email: 'analyst2@aig.in',
    role: 'analyst',
    hospital: 'AIG',
    status: 'Active',
    permissions: ['runAnalysis', 'viewPatients'],
  },
  {
    id: 'user_7',
    email: 'viewer@kims.in',
    role: 'viewer',
    hospital: 'KIMS',
    status: 'Active',
    permissions: ['readOnlyDashboard'],
  },
  {
    id: 'user_8',
    email: 'mohan@kues.in',
    role: 'hospital_admin',
    hospital: 'KUES',
    status: 'Active',
    permissions: ['uploadData', 'manageUsers'],
  },
];

const MOCK_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'audit_1',
    timestamp: '2026-05-16T14:32:00Z',
    user: 'rajesh@kims.in',
    action: 'DATA_UPLOAD',
    resource: '43 Back Pain assessments',
    hospital: 'KIMS',
    status: 'Success',
    details: '43 records uploaded to local DB. 43 records sent to master (anonymized).',
  },
  {
    id: 'audit_2',
    timestamp: '2026-05-16T10:15:00Z',
    user: 'mouli@metaloga.io',
    action: 'USER_CREATE',
    resource: 'analyst2@aig.in (Analyst)',
    hospital: 'AIG',
    status: 'Success',
    details: 'New user created and invite email sent.',
  },
  {
    id: 'audit_3',
    timestamp: '2026-05-15T16:45:00Z',
    user: 'mouli@metaloga.io',
    action: 'HOSPITAL_SUSPEND',
    resource: 'ABHIS (Abhishek Hospital)',
    hospital: 'ABHIS',
    status: 'Success',
    details: 'Hospital suspended due to compliance review.',
  },
  {
    id: 'audit_4',
    timestamp: '2026-05-15T09:30:00Z',
    user: 'priya@aig.in',
    action: 'LOGIN',
    resource: 'priya@aig.in',
    hospital: 'AIG',
    status: 'Success',
    details: 'IP: 192.168.1.100',
  },
  {
    id: 'audit_5',
    timestamp: '2026-05-15T08:15:00Z',
    user: 'unknown',
    action: 'LOGIN',
    resource: 'hack@phish.com',
    hospital: null,
    status: 'Failed',
    details: 'Invalid credentials. IP: 203.0.113.45',
  },
  {
    id: 'audit_6',
    timestamp: '2026-05-14T13:20:00Z',
    user: 'priya@aig.in',
    action: 'DATA_UPLOAD',
    resource: '32 Shoulder assessments',
    hospital: 'AIG',
    status: 'Success',
    details: '32 records uploaded. All sent to master.',
  },
  {
    id: 'audit_7',
    timestamp: '2026-05-14T11:00:00Z',
    user: 'mouli@metaloga.io',
    action: 'USER_CREATE',
    resource: 'doc@kims.in (Clinician)',
    hospital: 'KIMS',
    status: 'Success',
    details: 'Clinician user created.',
  },
  {
    id: 'audit_8',
    timestamp: '2026-05-13T15:30:00Z',
    user: 'mohan@kues.in',
    action: 'DATA_UPLOAD',
    resource: '38 Back Pain assessments',
    hospital: 'KUES',
    status: 'Success',
    details: '38 records uploaded to local. 38 to master.',
  },
];

const MOCK_STATS = {
  totalHospitals: 5,
  activeUsers: 18,
  totalPatients: 287,
  masterPatients: 287,
  totalAssessments: 412,
  lastUpload: { hospital: 'KIMS', date: 'May 16, 2026 14:32', count: 43 },
};

// ===== HELPER FUNCTIONS =====

function generateMockRows(hospital: string, condition: string): Record<string, string>[] {
  return Array.from({ length: 43 }, (_, i) => ({
    PatientID: `${hospital}_P${String(i + 1).padStart(3, '0')}`,
    Age: String(35 + Math.floor(Math.random() * 30)),
    Gender: Math.random() > 0.5 ? 'M' : 'F',
    STarT_Score: String(Math.floor(Math.random() * 9)),
    ROM_Flexion: String(55 + Math.floor(Math.random() * 40)),
    Physio_Score: String(40 + Math.floor(Math.random() * 50)),
    Pain: (Math.random() * 10).toFixed(1),
  }));
}

function autoDetectColumns(rows: Record<string, string>[]): Record<string, string> {
  if (rows.length === 0) return {};
  const firstRow = rows[0];
  const mapping: Record<string, string> = {};
  const autoMap: Record<string, string> = {
    PatientID: 'patient_code',
    STarT_Score: 'domain_scores.start',
    ROM_Flexion: 'domain_scores.rom_flex',
    Physio_Score: 'domain_scores.physio',
    Age: 'demographics.age',
    Gender: 'demographics.gender',
    Pain: 'domain_scores.pain',
  };

  Object.keys(firstRow).forEach(col => {
    mapping[col] = autoMap[col] || `field_${col}`;
  });

  return mapping;
}

function validateRows(rows: Record<string, string>[]): ValidationResult {
  const warnings: string[] = [];
  let errors = 0;

  rows.forEach((row, idx) => {
    if (!row.PatientID || row.PatientID.trim() === '') errors++;
    if (row.STarT_Score && (parseInt(row.STarT_Score) < 0 || parseInt(row.STarT_Score) > 9))
      warnings.push(`Row ${idx + 1}: STarT Score out of range (0-9)`);
  });

  // Add some generic warnings for demo
  if (warnings.length === 0) {
    warnings.push('2 records have future assessment dates (minor issue)');
    warnings.push('1 record missing comorbidity data');
  }

  return {
    totalRows: rows.length,
    errors,
    warnings: warnings.slice(0, 2),
    warningMessages: warnings,
  };
}

function anonymizeRows(rows: Record<string, string>[], hospital: string): Record<string, string>[] {
  const anonMap: Record<string, string> = {
    KIMS: 'Hospital A',
    AIG: 'Hospital B',
    KUES: 'Hospital C',
  };

  return rows.map(row => ({
    PatientHash: btoa(row.PatientID).replace(/=/g, '').toUpperCase().slice(0, 12),
    Age: row.Age,
    Gender: row.Gender,
    STarT_Score: row.STarT_Score,
    ROM_Flexion: row.ROM_Flexion,
    Physio_Score: row.Physio_Score,
    Pain: row.Pain,
    Hospital: anonMap[hospital] ?? 'Hospital X',
  }));
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ===== MAIN COMPONENT =====

export function AdminPanel() {
  // Auth state
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Upload Wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [previewLocal, setPreviewLocal] = useState<Record<string, string>[]>([]);
  const [previewMaster, setPreviewMaster] = useState<Record<string, string>[]>([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  // Data
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(MOCK_AUDIT_LOG);
  const [auditFilter, setAuditFilter] = useState('all');

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('admin_session');
    if (stored) {
      try {
        setAdminSession(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('admin_session');
      }
    }
  }, []);

  const handleLogin = () => {
    setLoginError('');
    const cred = MOCK_CREDENTIALS.find(c => c.email === loginEmail && c.password === loginPassword);
    if (!cred) {
      setLoginError('Email or password incorrect');
      return;
    }

    const session: AdminSession = {
      email: cred.email,
      role: cred.role,
      hospital: cred.hospital,
      name: cred.name,
    };
    setAdminSession(session);
    localStorage.setItem('admin_session', JSON.stringify(session));

    // Auto-set hospital for hospital admins in wizard
    if (cred.hospital) {
      setSelectedHospital(cred.hospital);
    }

    // Add login audit entry
    const auditEntry: AuditEntry = {
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: cred.email,
      action: 'LOGIN',
      resource: cred.email,
      hospital: cred.hospital,
      status: 'Success',
      details: `IP: 192.168.1.${Math.floor(Math.random() * 255)}`,
    };
    setAuditLog(prev => [auditEntry, ...prev]);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setAdminSession(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');
    setActiveTab('dashboard');
    resetWizard();
  };

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedCondition('');
    if (!adminSession?.hospital) setSelectedHospital('');
    setUploadedFileName('');
    setParsedRows([]);
    setColumnMapping({});
    setValidationResult(null);
    setPreviewLocal([]);
    setPreviewMaster([]);
    setConsentChecked(false);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  const handleWizardNext = () => {
    if (wizardStep === 1 && !selectedCondition) return;
    if (wizardStep === 2 && !selectedHospital) return;
    if (wizardStep === 3 && parsedRows.length === 0) return;
    if (wizardStep === 4) {
      const mapped = autoDetectColumns(parsedRows);
      setColumnMapping(mapped);
    }
    if (wizardStep === 5) {
      const validation = validateRows(parsedRows);
      setValidationResult(validation);
    }
    if (wizardStep === 6) {
      setPreviewLocal(parsedRows);
      const anon = anonymizeRows(parsedRows, selectedHospital);
      setPreviewMaster(anon);
    }

    setWizardStep(prev => Math.min(prev + 1, 6));
  };

  const handleWizardBack = () => {
    setWizardStep(prev => Math.max(prev - 1, 1));
  };

  const handleUploadConfirm = () => {
    if (!consentChecked) return;

    setUploadProgress(0);
    let currentProgress = 0;

    const progressIntervals = [
      { progress: 20, delay: 400 },
      { progress: 45, delay: 400 },
      { progress: 70, delay: 400 },
      { progress: 90, delay: 400 },
      { progress: 100, delay: 400 },
    ];

    progressIntervals.forEach((step, idx) => {
      setTimeout(() => {
        setUploadProgress(step.progress);

        if (step.progress === 100) {
          // Add audit entry
          const auditEntry: AuditEntry = {
            id: `audit_${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: adminSession?.email || 'unknown',
            action: 'DATA_UPLOAD',
            resource: `${parsedRows.length} ${selectedCondition} assessments`,
            hospital: selectedHospital,
            status: 'Success',
            details: `${parsedRows.length} records uploaded to local DB. ${parsedRows.length} records sent to master (anonymized).`,
          };
          setAuditLog(prev => [auditEntry, ...prev]);
          setUploadComplete(true);
        }
      }, step.delay * (idx + 1));
    });
  };

  const handleResetWizard = () => {
    resetWizard();
  };

  // ===== RENDER FUNCTIONS =====

  const renderLoginForm = () => (
    <div
      style={{
        fontFamily: '"DM Sans", sans-serif',
        backgroundColor: '#FAFBFC',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #D4DEE6',
          borderRadius: '12px',
          padding: '48px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1A2332', marginBottom: '8px' }}>
          RelVersiv Administration
        </h1>
        <p style={{ fontSize: '14px', color: '#647281', marginBottom: '32px' }}>Sign in to your admin account</p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A2332', display: 'block', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
            placeholder="admin@example.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #D4DEE6',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A2332', display: 'block', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            placeholder="Enter your password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #D4DEE6',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {loginError && (
          <div
            style={{
              backgroundColor: '#F5E5E1',
              border: '1px solid #C84C3D',
              color: '#8A2D28',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {loginError}
          </div>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔓 Sign In
        </button>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #D4DEE6' }}>
          <p style={{ fontSize: '12px', color: '#647281', marginBottom: '8px' }}>Demo Credentials:</p>
          <p style={{ fontSize: '11px', color: '#647281', margin: '4px 0' }}>System Admin: mouli@metaloga.io / password</p>
          <p style={{ fontSize: '11px', color: '#647281', margin: '4px 0' }}>Hospital Admin: rajesh@kims.in / kims123</p>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid #D4DEE6',
      }}
    >
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1A2332', margin: 0 }}>
        RelVersiv Admin Panel
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '13px', color: '#647281' }}>
          User: <span style={{ fontWeight: 600, color: '#1A2332' }}>{adminSession?.email}</span> ({adminSession?.role})
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#F0F5FA',
            color: '#A52D28',
            border: '1px solid #D4DEE6',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid #D4DEE6', paddingBottom: '12px' }}>
      {['dashboard', 'upload', 'hospitals', 'users', 'settings', 'audit'].map(tab => (
        <button
          key={tab}
          onClick={() => {
            setActiveTab(tab);
            if (tab !== 'upload') resetWizard();
          }}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === tab ? '#0D6A47' : 'transparent',
            color: activeTab === tab ? 'white' : '#647281',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {tab === 'dashboard' && 'Dashboard'}
          {tab === 'upload' && 'Data Upload'}
          {tab === 'hospitals' && 'Hospitals'}
          {tab === 'users' && 'Users'}
          {tab === 'settings' && 'Settings'}
          {tab === 'audit' && 'Audit Log'}
        </button>
      ))}
    </div>
  );

  const renderDashboard = () => (
    <div>
      {/* Quick Stats */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>QUICK STATS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D6A47' }}>
              {MOCK_STATS.totalHospitals}
            </div>
            <div style={{ fontSize: '13px', color: '#647281', marginTop: '4px' }}>Total Hospitals</div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D6A47' }}>
              {MOCK_STATS.activeUsers}
            </div>
            <div style={{ fontSize: '13px', color: '#647281', marginTop: '4px' }}>Active Users</div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D6A47' }}>
              {MOCK_STATS.totalPatients}
            </div>
            <div style={{ fontSize: '13px', color: '#647281', marginTop: '4px' }}>Total Patients</div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '20px',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0D6A47' }}>
              {MOCK_STATS.totalAssessments}
            </div>
            <div style={{ fontSize: '13px', color: '#647281', marginTop: '4px' }}>Total Assessments</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>RECENT ACTIVITY</h2>
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #D4DEE6',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          {auditLog.slice(0, 3).map((entry, idx) => (
            <div key={entry.id} style={{ paddingBottom: '16px', borderBottom: idx < 2 ? '1px solid #D4DEE6' : 'none', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1A2332' }}>
                    {entry.action === 'DATA_UPLOAD' && '📤 Data Upload'}
                    {entry.action === 'USER_CREATE' && '👤 User Created'}
                    {entry.action === 'HOSPITAL_SUSPEND' && '🚫 Hospital Suspended'}
                    {entry.action === 'LOGIN' && '🔓 Login'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#647281', marginTop: '2px' }}>
                    {entry.details}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: entry.status === 'Success' ? '#C8E6D7' : '#F5E5E1',
                    color: entry.status === 'Success' ? '#0D6A47' : '#8A2D28',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entry.status}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#647281' }}>{formatTimestamp(entry.timestamp)}</div>
            </div>
          ))}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #D4DEE6' }}>
            <button
              onClick={() => setActiveTab('audit')}
              style={{
                padding: '8px 12px',
                backgroundColor: 'transparent',
                color: '#0D6A47',
                border: '1px solid #0D6A47',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Full Audit Log →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>
        STEP 1: Select Condition
      </h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        {['Back Pain', 'Shoulder', 'Knee'].map(condition => (
          <button
            key={condition}
            onClick={() => setSelectedCondition(condition)}
            style={{
              padding: '12px 20px',
              backgroundColor: selectedCondition === condition ? '#0D6A47' : '#F0F5FA',
              color: selectedCondition === condition ? 'white' : '#1A2332',
              border: '1px solid ' + (selectedCondition === condition ? '#0D6A47' : '#D4DEE6'),
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {condition}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>
        STEP 2: Select Hospital
      </h3>
      <select
        value={selectedHospital}
        onChange={e => setSelectedHospital(e.target.value)}
        disabled={adminSession?.role === 'hospital_admin'}
        style={{
          padding: '10px 12px',
          border: '1px solid #D4DEE6',
          borderRadius: '8px',
          fontSize: '13px',
          fontFamily: '"DM Sans", sans-serif',
          width: '200px',
          cursor: adminSession?.role === 'hospital_admin' ? 'not-allowed' : 'pointer',
          backgroundColor: adminSession?.role === 'hospital_admin' ? '#F0F5FA' : 'white',
        }}
      >
        <option value="">-- Select Hospital --</option>
        {hospitals
          .filter(h => h.status === 'Active')
          .map(h => (
            <option key={h.code} value={h.code}>
              {h.name}
            </option>
          ))}
      </select>
      {adminSession?.role === 'hospital_admin' && (
        <div style={{ fontSize: '12px', color: '#647281', marginTop: '8px' }}>
          Hospital automatically set to your organization.
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>
        STEP 3: Upload CSV/Excel
      </h3>
      <div
        onClick={() => {
          if (selectedHospital && selectedCondition) {
            const mockRows = generateMockRows(selectedHospital, selectedCondition);
            setParsedRows(mockRows);
            setUploadedFileName(`assessment_${selectedCondition.toLowerCase()}.csv`);
          }
        }}
        style={{
          border: '2px dashed #D4DEE6',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#FAFBFC',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1A2332', marginBottom: '4px' }}>
          {uploadedFileName || 'Choose file or drag & drop'}
        </div>
        <div style={{ fontSize: '12px', color: '#647281' }}>CSV, Excel files accepted</div>
      </div>
      {uploadedFileName && (
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#0D6A47', fontWeight: 600 }}>
          ✓ {uploadedFileName} ({parsedRows.length} rows)
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>
        STEP 4: Map Columns
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F0F5FA' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>
                CSV Column
              </th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>
                → Database Field
              </th>
              <th style={{ padding: '10px', textAlign: 'center', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(columnMapping).map(([csvCol, dbField]) => (
              <tr key={csvCol} style={{ borderBottom: '1px solid #D4DEE6' }}>
                <td style={{ padding: '10px' }}>{csvCol}</td>
                <td style={{ padding: '10px' }}>{dbField}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: '#0D6A47', fontWeight: 600 }}>✓ auto-detect</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>
        STEP 5: Validate Data
      </h3>
      {validationResult && (
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '16px',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '12px', color: '#647281', marginBottom: '4px' }}>Rows to upload</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1A2332' }}>
              {validationResult.totalRows}
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '16px',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '12px', color: '#647281', marginBottom: '4px' }}>Validation errors</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: validationResult.errors > 0 ? '#A52D28' : '#0D6A47' }}>
              {validationResult.errors}
            </div>
          </div>
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid #D4DEE6',
              borderRadius: '12px',
              padding: '16px',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '12px', color: '#647281', marginBottom: '4px' }}>Warnings</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#D4A03D' }}>
              {validationResult.warnings.length}
            </div>
          </div>
        </div>
      )}
      {validationResult && validationResult.warnings.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#F2EBD9',
            border: '1px solid #D4A03D',
            borderRadius: '8px',
            padding: '12px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#8A6B1F', marginBottom: '8px' }}>Warnings:</div>
          {validationResult.warnings.map((w, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#8A6B1F', marginBottom: '4px' }}>
              • {w}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '16px' }}>
        STEP 6: Master Data Preview + Consent
      </h3>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332', marginBottom: '12px' }}>
          LOCAL COPY (Hospital Database):
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid #D4DEE6', borderRadius: '8px', backgroundColor: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F0F5FA' }}>
                {['PatientID', 'Age', 'Gender', 'STarT', 'ROM'].map(h => (
                  <th key={h} style={{ padding: '8px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewLocal.slice(0, 3).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #D4DEE6' }}>
                  <td style={{ padding: '8px' }}>{row.PatientID}</td>
                  <td style={{ padding: '8px' }}>{row.Age}</td>
                  <td style={{ padding: '8px' }}>{row.Gender}</td>
                  <td style={{ padding: '8px' }}>{row.STarT_Score}</td>
                  <td style={{ padding: '8px' }}>{row.ROM_Flexion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: '11px', color: '#647281', marginTop: '8px' }}>
          TOTAL: {previewLocal.length} records
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332', marginBottom: '12px' }}>
          ANONYMIZED COPY (Master Database):
        </div>
        <div style={{ overflowX: 'auto', border: '1px solid #D4DEE6', borderRadius: '8px', backgroundColor: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F0F5FA' }}>
                {['PatientHash', 'Age', 'Gender', 'STarT', 'Hospital'].map(h => (
                  <th key={h} style={{ padding: '8px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewMaster.slice(0, 3).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #D4DEE6' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '11px' }}>{row.PatientHash}</td>
                  <td style={{ padding: '8px' }}>{row.Age}</td>
                  <td style={{ padding: '8px' }}>{row.Gender}</td>
                  <td style={{ padding: '8px' }}>{row.STarT_Score}</td>
                  <td style={{ padding: '8px' }}>{row.Hospital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: '11px', color: '#647281', marginTop: '8px' }}>
          TOTAL: {previewMaster.length} records (names removed)
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#F9FAFB',
          border: '1px solid #D4DEE6',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'start', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={e => setConsentChecked(e.target.checked)}
            style={{ marginRight: '10px', marginTop: '2px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', color: '#1A2332' }}>
            I consent to send anonymized data to RelVersiv master database for research and model calibration purposes
          </span>
        </label>
      </div>

      {!uploadComplete ? (
        <>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1A2332' }}>Upload Progress</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0D6A47' }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#E8EDF4', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#0D6A47',
                    width: `${uploadProgress}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        <div
          style={{
            backgroundColor: '#D9F0E9',
            border: '1px solid #0D6A47',
            color: '#0D6A47',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ✓ Upload complete! {previewLocal.length} records sent to master database.
        </div>
      )}
    </div>
  );

  const renderDataUploadWizard = () => (
    <div>
      {/* Progress Bar */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          {[1, 2, 3, 4, 5, 6].map(step => (
            <div
              key={step}
              style={{
                flex: 1,
                height: '6px',
                backgroundColor: wizardStep >= step ? '#0D6A47' : '#E8EDF4',
                borderRadius: '3px',
                marginRight: step < 6 ? '8px' : '0',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {['Condition', 'Hospital', 'Upload', 'Map', 'Validate', 'Preview'].map((label, idx) => (
            <div key={label} style={{ fontSize: '11px', color: wizardStep > idx ? '#0D6A47' : '#647281', fontWeight: 600 }}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #D4DEE6',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        {wizardStep === 1 && renderStep1()}
        {wizardStep === 2 && renderStep2()}
        {wizardStep === 3 && renderStep3()}
        {wizardStep === 4 && renderStep4()}
        {wizardStep === 5 && renderStep5()}
        {wizardStep === 6 && renderStep6()}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        {wizardStep > 1 && !uploadComplete && (
          <button
            onClick={handleWizardBack}
            style={{
              padding: '10px 16px',
              backgroundColor: '#F0F5FA',
              color: '#1A2332',
              border: '1px solid #D4DEE6',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔄 Back
          </button>
        )}

        {uploadComplete ? (
          <button
            onClick={handleResetWizard}
            style={{
              padding: '10px 16px',
              backgroundColor: '#0D6A47',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↺ Start Over
          </button>
        ) : wizardStep < 6 ? (
          <button
            onClick={handleWizardNext}
            disabled={
              (wizardStep === 1 && !selectedCondition) ||
              (wizardStep === 2 && !selectedHospital) ||
              (wizardStep === 3 && parsedRows.length === 0)
            }
            style={{
              padding: '10px 16px',
              backgroundColor:
                (wizardStep === 1 && !selectedCondition) ||
                (wizardStep === 2 && !selectedHospital) ||
                (wizardStep === 3 && parsedRows.length === 0)
                  ? '#D4DEE6'
                  : '#0D6A47',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor:
                (wizardStep === 1 && !selectedCondition) ||
                (wizardStep === 2 && !selectedHospital) ||
                (wizardStep === 3 && parsedRows.length === 0)
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleUploadConfirm}
            disabled={!consentChecked || uploadProgress > 0}
            style={{
              padding: '10px 16px',
              backgroundColor: !consentChecked || uploadProgress > 0 ? '#D4DEE6' : '#0D6A47',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: !consentChecked || uploadProgress > 0 ? 'not-allowed' : 'pointer',
            }}
          >
            ✅ Confirm & Upload
          </button>
        )}
      </div>
    </div>
  );

  const renderHospitalsTab = () => (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          style={{
            padding: '10px 16px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + New Hospital
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F0F5FA' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Code</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>City</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((h, i) => (
              <tr key={h.code} style={{ borderBottom: '1px solid #D4DEE6' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: '#1A2332' }}>{h.code}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600, color: '#1A2332' }}>{h.name}</div>
                  <div style={{ fontSize: '12px', color: '#647281', marginTop: '2px' }}>
                    Admin: {h.adminName || '—'}
                  </div>
                </td>
                <td style={{ padding: '12px', color: '#647281' }}>{h.city}</td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      backgroundColor: h.status === 'Active' ? '#C8E6D7' : '#F5E5E1',
                      color: h.status === 'Active' ? '#0D6A47' : '#8A2D28',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {h.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button style={{ fontSize: '12px', backgroundColor: 'transparent', color: '#0D6A47', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    Edit
                  </button>
                  {' | '}
                  <button style={{ fontSize: '12px', backgroundColor: 'transparent', color: '#A52D28', border: 'none', cursor: 'pointer', fontWeight: 600, marginLeft: '4px' }}>
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          style={{
            padding: '10px 16px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + New User
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F0F5FA' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Hospital</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #D4DEE6' }}>
                <td style={{ padding: '12px', fontWeight: 600, color: '#1A2332' }}>{u.email}</td>
                <td style={{ padding: '12px', color: '#647281', fontSize: '12px' }}>
                  {u.role === 'system_admin' && 'System Admin'}
                  {u.role === 'hospital_admin' && 'Hospital Admin'}
                  {u.role === 'analyst' && 'Analyst'}
                  {u.role === 'clinician' && 'Clinician'}
                  {u.role === 'viewer' && 'Viewer'}
                </td>
                <td style={{ padding: '12px', color: '#647281', fontSize: '12px' }}>{u.hospital || '—'}</td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      backgroundColor: u.status === 'Active' ? '#C8E6D7' : '#F5E5E1',
                      color: u.status === 'Active' ? '#0D6A47' : '#8A2D28',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div>
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #D4DEE6',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginBottom: '20px' }}>Conditions Management</h3>
        {['Back Pain', 'Shoulder', 'Knee'].map(condition => (
          <div key={condition} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #D4DEE6' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' }}>
              <input type="checkbox" defaultChecked style={{ marginRight: '10px', cursor: 'pointer' }} />
              <span style={{ fontWeight: 600, color: '#1A2332', fontSize: '13px' }}>✓ {condition} (enabled)</span>
            </label>
            <div style={{ fontSize: '12px', color: '#647281', marginLeft: '24px' }}>
              Domains: {condition === 'Back Pain' ? 6 : 5} | Thresholds: tga=35, tar={condition === 'Knee' ? 70 : 60}
            </div>
          </div>
        ))}

        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1A2332', marginTop: '24px', marginBottom: '16px' }}>
          Global Settings
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A2332', display: 'block', marginBottom: '6px' }}>
            Default Anonymization
          </label>
          <select
            style={{
              padding: '10px 12px',
              border: '1px solid #D4DEE6',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              width: '200px',
            }}
          >
            <option>Anonymized</option>
            <option>Identified</option>
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: '#1A2332', display: 'block', marginBottom: '6px' }}>
            Session Timeout
          </label>
          <select
            style={{
              padding: '10px 12px',
              border: '1px solid #D4DEE6',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: '"DM Sans", sans-serif',
              width: '200px',
            }}
          >
            <option>15 minutes</option>
            <option>30 minutes</option>
            <option>1 hour</option>
          </select>
        </div>

        <button
          style={{
            marginTop: '20px',
            padding: '10px 16px',
            backgroundColor: '#0D6A47',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderAuditLogTab = () => (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <select
          value={auditFilter}
          onChange={e => setAuditFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #D4DEE6',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          <option value="all">All</option>
          <option value="upload">Data Upload</option>
          <option value="user">User Management</option>
          <option value="hospital">Hospital Management</option>
          <option value="login">Login</option>
        </select>
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: '#F0F5FA',
            color: '#1A2332',
            border: '1px solid #D4DEE6',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          📥 Export CSV
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#F0F5FA' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>
                Timestamp
              </th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>User</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Action</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Resource</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #D4DEE6' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLog.map((entry, i) => (
              <tr key={entry.id} style={{ borderBottom: '1px solid #D4DEE6' }}>
                <td style={{ padding: '10px', whiteSpace: 'nowrap', color: '#647281' }}>
                  {formatTimestamp(entry.timestamp)}
                </td>
                <td style={{ padding: '10px', color: '#1A2332', fontWeight: 500 }}>{entry.user}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ fontSize: '11px', backgroundColor: '#F0F5FA', color: '#1A2332', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {entry.action}
                  </span>
                </td>
                <td style={{ padding: '10px', color: '#647281' }}>{entry.resource}</td>
                <td style={{ padding: '10px' }}>
                  <span
                    style={{
                      backgroundColor: entry.status === 'Success' ? '#C8E6D7' : '#F5E5E1',
                      color: entry.status === 'Success' ? '#0D6A47' : '#8A2D28',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====

  if (!adminSession) {
    return renderLoginForm();
  }

  return (
    <div
      style={{
        fontFamily: '"DM Sans", sans-serif',
        backgroundColor: '#FAFBFC',
        minHeight: '100vh',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {renderHeader()}
        {renderTabs()}

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'upload' && renderDataUploadWizard()}
        {activeTab === 'hospitals' && renderHospitalsTab()}
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'settings' && renderSettingsTab()}
        {activeTab === 'audit' && renderAuditLogTab()}
      </div>
    </div>
  );
}
