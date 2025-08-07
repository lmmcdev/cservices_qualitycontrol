// src/providers/AppProviders.js
import { AgentsProvider } from '../context/agentsContext';
import { AuthProvider } from '../context/authContext';
import { LoadingProvider } from '../providers/loadingProvider';
import { SettingsProvider } from '../context/settingsContext';
import { TicketsProvider } from '../context/ticketsContext';
import { NotificationProvider } from '../context/notificationsContext';
import { FiltersProvider } from '../context/filterContext';
import { ProfilePhotoProvider } from '../context/profilePhotoContext';
import { SidebarProvider } from '../context/sidebarContext';


export default function AppProviders({ children }) {
  return (
    <AgentsProvider>
      <AuthProvider>
        <LoadingProvider>
          <SettingsProvider>
                <TicketsProvider>
                      <NotificationProvider>
                        <FiltersProvider>
                          <ProfilePhotoProvider>
                            <SidebarProvider>
                              {children}
                            </SidebarProvider>
                          </ProfilePhotoProvider>
                        </FiltersProvider>
                      </NotificationProvider>
                </TicketsProvider>
          </SettingsProvider>
        </LoadingProvider>
      </AuthProvider>
    </AgentsProvider>
  );
}
