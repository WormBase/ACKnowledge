import React from 'react';
import ReactDOM from 'react-dom';
import './bootstrap.min.css';
import './bootstrap-theme.min.css';
import './afp.css';
import './index.css';
import App from './App';
import {unregister} from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
unregister();
