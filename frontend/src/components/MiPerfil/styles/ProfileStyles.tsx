export function ProfileStyles() {
    return (
        <style>{`
            .mp-root {
                min-height: 100vh;
                background: transparent;
                font-family: inherit;
                color: #0f172a;
                border-radius: 20px;
                overflow: hidden;
            }

            .mp-root * { box-sizing: border-box; }

            /* ── Page layout ── */
            .mp-page {
                max-width: 1100px;
                margin: 0 auto;
                padding: 48px 24px 80px;
            }

            /* ── Entrance Animation ── */
            .mp-content-animate {
                animation: mp-content-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes mp-content-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* ── Header ── */
            .mp-header {
                margin-bottom: 48px;
            }
            .mp-header-eyebrow {
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                color: #64748b;
                margin-bottom: 8px;
            }
            .mp-header-title {
                font-family: inherit;
                font-size: clamp(32px, 5vw, 48px);
                font-weight: 600;
                line-height: 1.1;
                color: #0f172a;
                margin: 0 0 8px;
            }
            .mp-header-title em {
                font-style: italic;
                color: #2563eb;
            }
            .mp-header-sub {
                font-size: 15px;
                color: #475569;
                font-weight: 400;
            }

            /* ── Loading ── */
            .mp-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 400px;
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

            /* ── Grid ── */
            .mp-grid {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 28px;
                align-items: start;
            }
            @media (max-width: 900px) {
                .mp-grid { grid-template-columns: 1fr; }
            }

            /* ── Sidebar ── */
            .mp-sidebar {
                position: sticky;
                top: 28px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            /* ── Card ── */
            .mp-card {
                background: #ffffff;
                border-radius: 20px;
                border: 1px solid #e2e8f0;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
                transition: box-shadow 0.2s ease;
            }
            .mp-card:hover {
                box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 8px 28px rgba(0,0,0,0.06);
            }

            /* ── Profile card ── */
            .mp-profile-card {
                padding: 0;
            }
            .mp-profile-banner {
                height: 88px;
                background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #2563eb 100%);
                position: relative;
            }
            .mp-profile-avatar-wrap {
                display: flex;
                justify-content: center;
                margin-top: -44px;
                margin-bottom: 16px;
                position: relative;
                z-index: 1;
            }
            .mp-avatar-outer {
                position: relative;
                display: inline-flex;
            }
            .mp-avatar {
                width: 88px;
                height: 88px;
                border-radius: 50%;
                border: 4px solid #fff;
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            }
            .mp-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .mp-avatar-initial {
                font-family: inherit;
                font-weight: 600;
                font-size: 32px;
                color: #fff;
            }
            .mp-avatar-cam-btn {
                position: absolute;
                bottom: 2px;
                right: 2px;
                width: 26px;
                height: 26px;
                border-radius: 50%;
                background: #2563eb;
                border: 2px solid #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background 0.2s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            .mp-avatar-cam-btn:hover { background: #1d4ed8; }
            .mp-profile-info {
                text-align: center;
                padding: 0 20px 24px;
            }
            .mp-profile-name {
                font-family: inherit;
                font-size: 22px;
                font-weight: 600;
                color: #0f172a;
                margin: 0 0 8px;
            }
            .mp-badges {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 20px;
            }
            .mp-badge-role {
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                background: #eff6ff;
                color: #2563eb;
                padding: 4px 10px;
                border-radius: 20px;
                border: 1px solid #bfdbfe;
            }
            .mp-badge-status {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 11px;
                font-weight: 500;
                padding: 4px 10px;
                border-radius: 20px;
            }
            .mp-badge-status.active {
                background: #f0fdf4;
                color: #16a34a;
                border: 1px solid #bbf7d0;
            }
            .mp-badge-status.inactive {
                background: #fef2f2;
                color: #dc2626;
                border: 1px solid #fecaca;
            }
            .mp-badge-dot {
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: currentColor;
            }
            .mp-contact-list {
                list-style: none;
                padding: 16px 0 0;
                margin: 0;
                border-top: 1px solid #e2e8f0;
                display: flex;
                flex-direction: column;
                gap: 10px;
                text-align: left;
            }
            .mp-contact-item {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 13px;
                color: #475569;
            }
            .mp-contact-icon {
                width: 30px;
                height: 30px;
                border-radius: 8px;
                background: #f1f5f9;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            .mp-contact-text {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            /* ── Nav tabs ── */
            .mp-nav {
                display: flex;
                background: #fff;
                border-radius: 14px;
                border: 1px solid #e2e8f0;
                overflow: hidden;
                padding: 5px;
                gap: 4px;
            }
            .mp-nav-btn {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 7px;
                padding: 10px 14px;
                border: none;
                border-radius: 10px;
                font-family: inherit;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                background: transparent;
                color: #64748b;
            }
            .mp-nav-btn.active {
                background: #0f172a;
                color: #fff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            .mp-nav-btn:not(.active):hover {
                background: #f1f5f9;
                color: #334155;
            }

            /* ── Main content ── */
            .mp-main {
                display: flex;
                flex-direction: column;
                gap: 0;
            }

            .mp-main > * {
                animation: mp-section-in 0.2s ease-out forwards;
            }

            @keyframes mp-section-in {
                from {
                    opacity: 0.6;
                    filter: blur(2px);
                }
                to {
                    opacity: 1;
                    filter: blur(0);
                }
            }

            /* ── Card header ── */
            .mp-card-header {
                padding: 24px 28px 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            .mp-card-title {
                font-family: inherit;
                font-size: 22px;
                font-weight: 600;
                color: #0f172a;
                margin: 0 0 4px;
            }
            .mp-card-desc {
                font-size: 13px;
                color: #64748b;
                margin: 0;
            }
            .mp-card-body {
                padding: 28px;
            }

            /* ── Form grid ── */
            .mp-form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            @media (max-width: 600px) {
                .mp-form-row { grid-template-columns: 1fr; }
            }
            .mp-form-full {
                margin-bottom: 20px;
            }

            /* ── Field ── */
            .mp-field { display: flex; flex-direction: column; gap: 6px; }
            .mp-label {
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 0.04em;
                text-transform: uppercase;
                color: #475569;
            }
            .mp-required { color: #2563eb; }

            /* Override shadcn Input */
            .mp-input-wrap input,
            .mp-input-wrap .mp-input {
                height: 44px;
                border-radius: 10px;
                border: 1.5px solid #cbd5e1;
                background: #ffffff;
                font-family: inherit;
                font-size: 14px;
                color: #0f172a;
                transition: border-color 0.2s, box-shadow 0.2s;
                padding: 0 14px;
                width: 100%;
                outline: none;
            }
            .mp-input-wrap input:focus,
            .mp-input-wrap .mp-input:focus {
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                background: #fff;
            }
            .mp-input-wrap input:disabled {
                background: #f1f5f9;
                color: #94a3b8;
                cursor: not-allowed;
            }
            .mp-input-err input {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 3px rgba(239,68,68,0.08) !important;
            }

            /* Password field */
            .mp-pw-wrap {
                position: relative;
            }
            .mp-pw-wrap input {
                padding-right: 44px !important;
            }
            .mp-pw-toggle {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                cursor: pointer;
                color: #64748b;
                display: flex;
                align-items: center;
                padding: 4px;
                border-radius: 4px;
                transition: color 0.15s;
            }
            .mp-pw-toggle:hover { color: #334155; }

            .mp-field-error {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #ef4444;
                margin: 0;
                font-weight: 500;
            }

            /* ── Disabled field style ── */
            .mp-disabled-field {
                height: 44px;
                border-radius: 10px;
                border: 1.5px solid #e2e8f0;
                background: #f1f5f9;
                display: flex;
                align-items: center;
                padding: 0 14px;
                font-size: 14px;
                color: #94a3b8;
            }

            /* ── Select override ── */
            .mp-select-trigger {
                height: 44px !important;
                border-radius: 10px !important;
                border: 1.5px solid #e2e8f0 !important;
                background: #f1f5f9 !important;
                font-family: inherit !important;
                font-size: 14px !important;
                color: #94a3b8 !important;
            }

            /* ── Date button ── */
            .mp-date-btn {
                height: 44px;
                width: 100%;
                border-radius: 10px;
                border: 1.5px solid #cbd5e1;
                background: #ffffff;
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 0 14px;
                font-family: inherit;
                font-size: 14px;
                color: #0f172a;
                cursor: pointer;
                transition: border-color 0.2s, box-shadow 0.2s;
                text-align: left;
            }
            .mp-date-btn:hover, .mp-date-btn:focus {
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
                background: #fff;
                outline: none;
            }
            .mp-date-btn.placeholder { color: #94a3b8; }
            .mp-date-err { border-color: #ef4444 !important; }

            /* ── Photo section ── */
            .mp-photo-section {
                background: #f8fafc;
                border: 1.5px dashed #cbd5e1;
                border-radius: 14px;
                padding: 20px;
                margin-top: 4px;
            }
            .mp-photo-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #475569;
                margin-bottom: 12px;
                font-weight: 500;
            }
            .mp-file-input {
                font-family: inherit;
                font-size: 13px;
                color: #475569;
                width: 100%;
            }
            .mp-file-input::file-selector-button {
                font-family: inherit;
                font-size: 13px;
                font-weight: 600;
                color: #2563eb;
                background: #fff;
                border: 1.5px solid #bfdbfe;
                border-radius: 8px;
                padding: 6px 14px;
                cursor: pointer;
                margin-right: 12px;
                transition: background 0.15s;
            }
            .mp-file-input::file-selector-button:hover {
                background: #eff6ff;
            }

            /* ── Divider ── */
            .mp-divider {
                height: 1px;
                background: #e2e8f0;
                margin: 24px 0;
            }

            /* ── Section label ── */
            .mp-section-label {
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
                color: #94a3b8;
                margin-bottom: 16px;
            }

            /* ── Submit button ── */
            .mp-submit-row {
                display: flex;
                justify-content: flex-end;
                padding-top: 8px;
            }
            .mp-btn-primary {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 11px 24px;
                border-radius: 10px;
                border: none;
                background: #0f172a;
                color: #fff;
                font-family: inherit;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
                box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                letter-spacing: 0.01em;
            }
            .mp-btn-primary:hover:not(:disabled) {
                background: #1e293b;
                box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                transform: translateY(-1px);
            }
            .mp-btn-primary:active:not(:disabled) { transform: translateY(0); }
            .mp-btn-primary:disabled {
                opacity: 0.45;
                cursor: not-allowed;
                transform: none;
            }
            .mp-btn-secondary {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 11px 24px;
                border-radius: 10px;
                border: 1.5px solid #2563eb;
                background: transparent;
                color: #2563eb;
                font-family: inherit;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s, transform 0.1s;
            }
            .mp-btn-secondary:hover:not(:disabled) {
                background: #eff6ff;
                transform: translateY(-1px);
            }
            .mp-btn-secondary:disabled {
                opacity: 0.45;
                cursor: not-allowed;
            }

            /* ── Password strength ── */
            .mp-pwd-strength {
                margin-top: 8px;
            }
            .mp-pwd-bars {
                display: flex;
                gap: 4px;
                margin-bottom: 4px;
            }
            .mp-pwd-bar {
                height: 3px;
                flex: 1;
                border-radius: 4px;
                background: #cbd5e1;
                transition: background 0.3s;
            }
            .mp-pwd-label {
                font-size: 11px;
                font-weight: 600;
            }

            /* ── Security tips ── */
            .mp-tips {
                background: #f8fafc;
                border-radius: 12px;
                padding: 16px;
                border: 1px solid #e2e8f0;
                margin-top: 4px;
            }
            .mp-tips-title {
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.07em;
                color: #64748b;
                margin-bottom: 10px;
            }
            .mp-tips-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column; gap: 6px; }
            .mp-tip-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #475569; }
            .mp-tip-check { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #cbd5e1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
            .mp-tip-check.met { background: #22c55e; border-color: #22c55e; color: #fff; }

            /* ── DARK MODE OVERRIDES (ULTRA CINEMATIC) ── */
            .dark .mp-root {
                background: linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%) !important;
                color: #f1f5f9 !important;
                min-height: 100vh;
                border-radius: 20px;
                overflow: hidden;
            }

            .dark .mp-header-title {
                color: #ffffff !important;
                text-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
            }

            .dark .mp-header-sub {
                color: #94a3b8 !important;
            }

            .dark .mp-card {
                background: rgba(15, 23, 42, 0.7) !important;
                backdrop-filter: blur(12px) !important;
                border: 1px solid rgba(99, 102, 241, 0.3) !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
            }

            .dark .mp-profile-name {
                color: #ffffff !important;
            }

            .dark .mp-contact-item {
                color: #cbd5e1 !important;
            }

            .dark .mp-contact-icon {
                background: rgba(99, 102, 241, 0.15) !important;
                color: #818cf8 !important;
                border: 1px solid rgba(99, 102, 241, 0.2) !important;
            }

            .dark .mp-contact-list {
                border-color: rgba(255, 255, 255, 0.1) !important;
            }

            .dark .mp-nav {
                background: rgba(2, 6, 23, 0.8) !important;
                border: 1px solid rgba(99, 102, 241, 0.3) !important;
                padding: 6px !important;
            }

            .dark .mp-nav-btn {
                color: #64748b !important;
            }

            .dark .mp-nav-btn:not(.active):hover {
                background: rgba(255, 255, 255, 0.05) !important;
                color: #ffffff !important;
            }

            .dark .mp-nav-btn.active {
                background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
                color: #ffffff !important;
                box-shadow: 0 4px 20px rgba(79, 70, 229, 0.5) !important;
            }

            .dark .mp-card-header {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            }

            .dark .mp-card-title {
                color: #ffffff !important;
            }

            .dark .mp-label {
                color: #94a3b8 !important;
                font-size: 11px !important;
                letter-spacing: 0.1em !important;
            }

            .dark .mp-input-wrap input,
            .dark .mp-input-wrap .mp-input,
            .dark .mp-date-btn {
                background: rgba(2, 6, 23, 0.6) !important;
                border: 1.5px solid rgba(99, 102, 241, 0.2) !important;
                color: #ffffff !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            .dark .mp-input-wrap input:focus,
            .dark .mp-date-btn:focus {
                border-color: #6366f1 !important;
                background: rgba(2, 6, 23, 0.8) !important;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2) !important;
            }

            .dark .mp-disabled-field,
            .dark .mp-select-trigger {
                background: rgba(2, 6, 23, 0.4) !important;
                border-color: rgba(255, 255, 255, 0.05) !important;
                color: #475569 !important;
            }

            .dark .mp-divider {
                background: rgba(255, 255, 255, 0.08) !important;
            }

            .dark .mp-btn-primary {
                background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
                color: #ffffff !important;
                box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3) !important;
                border: none !important;
            }

            .dark .mp-btn-primary:hover:not(:disabled) {
                transform: translateY(-2px) !important;
                box-shadow: 0 10px 25px rgba(79, 70, 229, 0.6) !important;
            }

            .dark .mp-photo-section {
                background: rgba(2, 6, 23, 0.4) !important;
                border: 1.5px dashed rgba(99, 102, 241, 0.4) !important;
            }

            .dark .mp-tips {
                background: rgba(99, 102, 241, 0.05) !important;
                border: 1px solid rgba(99, 102, 241, 0.2) !important;
            }

            .dark .mp-badge-role {
                background: rgba(99, 102, 241, 0.2) !important;
                border: 1px solid rgba(99, 102, 241, 0.4) !important;
                color: #a5b4fc !important;
            }

            .dark .mp-avatar {
                border: 4px solid #0f172a !important;
                box-shadow: 0 0 30px rgba(79, 70, 229, 0.4) !important;
            }

            .dark .mp-root .bg-white {
                background-color: transparent !important;
            }
            .dark .mp-root .bg-slate-50 {
                background-color: rgba(99, 102, 241, 0.1) !important;
            }
            .dark .mp-root .border-slate-300,
            .dark .mp-root .border-slate-200 {
                border-color: rgba(99, 102, 241, 0.2) !important;
            }
            .dark .mp-root .text-slate-500 {
                color: #94a3b8 !important;
            }


        `}</style>
    );
}
