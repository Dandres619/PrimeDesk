import { Loader2 } from 'lucide-react';

export function LoadingView() {
    return (
        <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        </div>
    );
}
