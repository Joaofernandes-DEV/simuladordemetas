import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { aplicarTema, temaInicial } from './theme';
import './styles/app.css';

// Aplica o tema antes do primeiro desenho (a CSP não permite script inline no HTML).
aplicarTema(temaInicial());

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
