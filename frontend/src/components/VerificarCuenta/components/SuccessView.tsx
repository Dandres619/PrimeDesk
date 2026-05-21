import { CheckCircle2 } from 'lucide-react';

export function SuccessView() {
    return (
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-emerald-500/15 rounded-full border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
        </div>
    );
}

