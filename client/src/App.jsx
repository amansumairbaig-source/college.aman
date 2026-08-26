import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import SubmitComplaintModal from './components/SubmitComplaintModal';
import ComplaintDetailsModal from './components/ComplaintDetailsModal';
import EmailSimulatorModal from './components/EmailSimulatorModal';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState(role === 'admin' || role === 'staff' ? 'admin' : 'student');

  // Modals state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
  };

  return (
    <div className="app-container">
      {/* Sticky Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenEmailModal={() => setEmailModalOpen(true)}
        onSelectComplaint={handleSelectComplaint}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'student' && (
          <StudentDashboard
            onOpenSubmit={() => setSubmitModalOpen(true)}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
      </main>

      {/* Modals & Dialogs */}
      <SubmitComplaintModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onComplaintCreated={(newComplaint) => {
          setSelectedComplaintId(newComplaint.id);
        }}
      />

      <ComplaintDetailsModal
        complaintId={selectedComplaintId}
        isOpen={Boolean(selectedComplaintId)}
        onClose={() => setSelectedComplaintId(null)}
      />

      <EmailSimulatorModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
