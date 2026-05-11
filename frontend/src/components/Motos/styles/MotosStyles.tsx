export function MotosStyles() {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      /* Hide arrows in number inputs */
      .no-arrows::-webkit-outer-spin-button,
      .no-arrows::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .no-arrows {
        -moz-appearance: textfield;
      }

      /* Custom loading ring for consistency */
      .motos-loading-ring {
        display: inline-block;
        width: 50px;
        height: 50px;
        border: 3px solid rgba(59, 130, 246, 0.3);
        border-radius: 50%;
        border-top-color: #3b82f6;
        animation: spin 1s ease-in-out infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}} />
  );
}
