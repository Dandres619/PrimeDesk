import { XCircle } from 'lucide-react';

export function ErrorView() {
    return (
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-rose-500/15 rounded-full border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
                <XCircle className="w-12 h-12 text-rose-400" />
            </div>
        </div>
    );
}

