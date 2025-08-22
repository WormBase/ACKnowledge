import React from 'react';
import { OverlayTrigger, Tooltip, Glyphicon } from 'react-bootstrap';

const AutoDetectedBadge = () => {
    const tooltip = (
        <Tooltip id="auto-detected-tooltip">
            This field is prepopulated by machine learning methods.
        </Tooltip>
    );

    return (
        <OverlayTrigger placement="top" overlay={tooltip}>
            <span style={{
                display: 'inline-flex', 
                alignItems: 'center', 
                fontSize: '12px', 
                color: '#333',
                backgroundColor: '#ffffff',
                padding: '4px 8px',
                borderRadius: '12px',
                border: '2px solid #ddd',
                fontWeight: 'normal',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
                <span 
                    style={{
                        marginRight: '6px', 
                        color: '#ffd700',
                        fontSize: '14px'
                    }}
                >⚡</span>
                Auto-detected
            </span>
        </OverlayTrigger>
    );
};

export default AutoDetectedBadge;