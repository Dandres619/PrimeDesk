import { XCircle } from 'lucide-react';

export function ErrorView() {
    return (
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-50 rounded-full border border-red-100">
                <XCircle className="w-12 h-12 text-red-500" />
            </div>
        </div>
    );
}
