// Skeleton.jsx
import React from 'react';

const Skeleton = ({ type = 'text', width, height, className = '', style = {} }) => {
    const customStyle = {
        width: width,
        height: height,
        ...style
    };

    const getSkeletonClass = () => {
        switch (type) {
            case 'circle': return 'skeleton skeleton-shimmer skeleton-circle';
            case 'title': return 'skeleton skeleton-shimmer skeleton-title';
            case 'image': return 'skeleton skeleton-shimmer skeleton-image';
            case 'card': return 'skeleton-card skeleton-shimmer';
            default: return 'skeleton skeleton-shimmer skeleton-text';
        }
    };

    if (type === 'card') {
        return (
            <div className={`skeleton-card skeleton-shimmer ${className}`} style={customStyle}>
                <div className="skeleton skeleton-shimmer skeleton-image" style={{ height: '180px' }}></div>
                <div className="skeleton skeleton-shimmer skeleton-title"></div>
                <div className="skeleton skeleton-shimmer skeleton-text" style={{ width: '80%' }}></div>
                <div className="skeleton skeleton-shimmer skeleton-text" style={{ width: '60%' }}></div>
                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                    <div className="skeleton skeleton-shimmer" style={{ height: '40px', borderRadius: '8px' }}></div>
                </div>
            </div>
        );
    }

    return <div className={`${getSkeletonClass()} ${className}`} style={customStyle}></div>;
};

export default Skeleton;
