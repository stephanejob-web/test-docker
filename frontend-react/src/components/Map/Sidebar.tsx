import React from 'react';
import { Paper } from '@mui/material';

interface SidebarProps {
    children: React.ReactNode;
    width?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ children, width = 400 }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: width,
                zIndex: 1100, // Higher than map, lower than modals
                borderRadius: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible',
                backgroundColor: '#fff',
                borderRight: '1px solid #dadce0', // Distinct edge
            }}
        >
            {children}
        </Paper>
    );
};

export default Sidebar;
