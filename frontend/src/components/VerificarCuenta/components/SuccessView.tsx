import { CheckCircle2 } from 'lucide-react';

export function SuccessView() {
    return (
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-50 rounded-full border border-green-100">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
        </div>
    );
}
