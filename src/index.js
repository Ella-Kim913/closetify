import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import ClothesList from './data/clothes.json';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App ClothesList={ClothesList} />
);