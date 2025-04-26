import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Usuario from "./components/pages/usuario/Usuario";
import Cliente from "./components/pages/cliente/Cliente";
import Fornecedor from "./components/pages/fornecedor/Fornecedor";
import Produto from "./components/pages/produto/Produto";
import Login from "./components/pages/usuario/Login";
import Registrar from "./components/pages/usuario/Registrar";
import Venda from "./components/pages/venda/Venda";
import Layout from "./components/layout/Layout";
import Dashboard from "./components/pages/dashboard/Dashboard";
import Home from "./components/pages/home/Home";
import { UserProvider } from "./context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <UserProvider>
        <Layout>
          <Routes>
            <Route path="/produtos" element={<Produto />} />
            <Route path="/fornecedores" element={<Fornecedor />} />
            <Route path="/usuarios" element={<Usuario />} />
            <Route path="/clientes" element={<Cliente />} />
            <Route path="/vendas" element={<Venda />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<Registrar />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Home />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop={false}
            closeOnClick
          />
        </Layout>
      </UserProvider>
    </Router>
  );
}

export default App;
