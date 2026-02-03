import React from 'react';

const Loader = ({ size = 48, color = 'var(--accent-blue-primary)' }) => {
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
        },
        spinner: {
            animation: 'spin 1s linear infinite',
        },
    };

    return (
        <div style={styles.container} aria-label="Loading">
            <style>
                {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          @keyframes dash {
            0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
            50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
            100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
          }
        `}
            </style>
            <svg
                width={size}
                height={size}
                viewBox="0 0 50 50"
                style={styles.spinner}
            >
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    style={{
                        animation: 'dash 1.5s ease-in-out infinite',
                    }}
                />
            </svg>
        </div>
    );
};

export default Loader;
