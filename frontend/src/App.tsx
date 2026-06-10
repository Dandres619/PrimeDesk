
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { MobileDetectDialog } from '@/components/ui/MobileDetectDialog';

const MOBILE_PROMPT_KEY = 'pd_mobile_prompt_dismissed';

function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export default function App() {
    const [showMobileDialog, setShowMobileDialog] = useState(false);

    useEffect(() => {
        if (isMobileDevice() && !sessionStorage.getItem(MOBILE_PROMPT_KEY)) {
            setShowMobileDialog(true);
        }
    }, []);

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            sessionStorage.setItem(MOBILE_PROMPT_KEY, 'true');
        }
        setShowMobileDialog(open);
    };

    return (
        <ThemeProvider>
            <AuthProvider>
                <AppRoutes />
                <MobileDetectDialog open={showMobileDialog} onOpenChange={handleDialogChange} />
            </AuthProvider>
        </ThemeProvider>
    );
}