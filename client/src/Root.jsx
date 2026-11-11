import App from './App';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './components/Toast';
import { InitialDataProvider } from './lib/initialData';

// Providers shared by the browser entry and the SSR entry; only the router differs.
export default function Root({ initialData }) {
  return (
    <InitialDataProvider value={initialData}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </InitialDataProvider>
  );
}
