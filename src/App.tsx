import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './hooks/useRedux';
import TemplateListPage from './pages/TemplateListPage';
import ImportPage from './pages/ImportPage';
import EditorPage from './pages/EditorPage';
import LegacyAlertsDashboard from './pages/LegacyAlertsDashboard';
import LegacyAlertDetails from './pages/LegacyAlertDetails';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

import SettingsPage from './pages/settings/SettingsPage';
import NewMessageDynamic from './pages/messages/NewMessageDynamic';

const AppContent: React.FC = () => {
  const { isDarkMode } = useAppSelector(state => state.theme);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <BrowserRouter>
      <div className={`${isDarkMode ? 'dark' : ''}`}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><TemplateListPage /></ProtectedRoute>} />
          <Route path="/import" element={<ProtectedRoute><ImportPage /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
          <Route path="/legacy-alerts" element={<ProtectedRoute><LegacyAlertsDashboard /></ProtectedRoute>} />
          <Route path="/legacy-alerts/:alertId" element={<ProtectedRoute><LegacyAlertDetails /></ProtectedRoute>} />
          
          {/* Form Builder Settings Routes */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/settings/template-builder" element={<Navigate to="/settings?category=messages&tab=builder" replace />} />
          <Route path="/settings/field-library" element={<Navigate to="/settings?category=messages&tab=library" replace />} />
          <Route path="/settings/validation-rules" element={<Navigate to="/settings?category=messages&tab=validation" replace />} />
          <Route path="/settings/dropdown-masters" element={<Navigate to="/settings?category=messages&tab=dropdowns" replace />} />
          <Route path="/settings/template-versions" element={<Navigate to="/settings?category=messages&tab=versions" replace />} />
          <Route path="/settings/audit-history" element={<Navigate to="/settings?category=messages&tab=audit" replace />} />

          {/* Dynamic Message Creation Entry Form */}
          <Route path="/messages/new" element={<ProtectedRoute><NewMessageDynamic /></ProtectedRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;