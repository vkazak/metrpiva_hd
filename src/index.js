import CoreJS from 'core-js/actual'; // eslint-disable-line

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { NextUIProvider } from '@nextui-org/react';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <NextUIProvider>
        <App />
    </NextUIProvider>
);
