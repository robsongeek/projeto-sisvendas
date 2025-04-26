// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import App from './App';


// test('renders learn react link', () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

// import { render, screen } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import App from './App';

// test('Renderiza a navegação básica', async () => {
//   render(
//     <MemoryRouter>
//       <App />
//     </MemoryRouter>
//   );

//   // Verifica se o componente principal está presente
//   expect(screen.getByRole('main')).toBeInTheDocument();
// });

// App.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
// jest.mock('./components/pages/usuario/Usuario', () => () => <div>Usuário Mock</div>);
// jest.mock('./components/pages/cliente/Cliente', () => () => <div>Cliente Mock</div>);
jest.mock('./components/pages/fornecedor/Fornecedor', () => () => <div>Fornecedor Mock</div>);
// jest.mock('./components/pages/produto/Produto', () => () => <div>Produto Mock</div>);
// jest.mock('./components/pages/usuario/Login', () => () => <div>Login Mock</div>);

test('Renderiza a navegação básica', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  
  // expect(screen.getByText('Login Mock')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});