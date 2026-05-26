
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ThemeProvider>
    );
}