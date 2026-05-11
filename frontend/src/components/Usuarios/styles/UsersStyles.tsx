export function UsersStyles() {
    return (
        <style>{`
            .mp-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 200px);
                gap: 16px;
            }
            .mp-loading-ring {
                width: 40px;
                height: 40px;
                border: 3px solid #cbd5e1;
                border-top-color: #2563eb;
                border-radius: 50%;
                animation: mp-spin 0.8s linear infinite;
            }
            @keyframes mp-spin { to { transform: rotate(360deg); } }
            .mp-loading-text {
                font-size: 14px;
                color: #64748b;
                font-weight: 500;
            }
        `}</style>
    );
}
