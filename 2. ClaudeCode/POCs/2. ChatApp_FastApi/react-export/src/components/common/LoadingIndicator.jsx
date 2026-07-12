export function LoadingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 4, animation: 'msgIn .18s ease' }}>
      <div
        style={{
          padding: '12px 14px',
          borderRadius: '4px 16px 16px 16px',
          background: 'var(--bubble)',
          display: 'flex',
          gap: 4,
          alignItems: 'center',
        }}
      >
        {[0, 0.18, 0.36].map((delay) => (
          <span
            key={delay}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--sub)',
              animation: `typingDot 1.1s ${delay}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
