import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProjectManagement from './pages/project-management';
import PersonalTimeEntries from './pages/personal-time-entries';
import TimeEntryCreation from './pages/time-entry-creation';
import CategoryAdministration from './pages/category-administration';
import LoginAuthentication from './pages/login-authentication';
import TeamDashboard from './pages/team-dashboard';
import CalendarImport from './pages/calendar-import';

import UserRegistration from 'pages/user-registration';
import PasswordResetRequest from './pages/password-reset-request';
import PasswordResetCompletion from './pages/password-reset-completion';
import UserSettings from './pages/user-settings';
import CollaboratorManagement from './pages/collaborator-management';

function Routes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<LoginAuthentication />} />
          <Route path="/project-management" element={<ProjectManagement />} />
          <Route path="/personal-time-entries" element={<PersonalTimeEntries />} />
          <Route path="/time-entry-creation" element={<TimeEntryCreation />} />
          <Route path="/category-administration" element={<CategoryAdministration />} />
          <Route path="/login-authentication" element={<LoginAuthentication />} />
          <Route path="/team-dashboard" element={<TeamDashboard />} />
          <Route path="/calendar-import" element={<CalendarImport />} />
          <Route path="/user-registration" element={<UserRegistration />} />
          <Route path="/password-reset-request" element={<PasswordResetRequest />} />
          <Route path="/password-reset-completion" element={<PasswordResetCompletion />} />
          <Route path="/user-settings" element={<UserSettings />} />
          <Route path="/collaborator-management" element={<CollaboratorManagement />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default Routes;