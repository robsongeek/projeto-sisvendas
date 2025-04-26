// npm test -- Cliente.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Cliente from "./Cliente";
import { api } from "../../../utils/api";
import { toast } from "react-toastify";
// Mock das dependências
jest.mock("../../../utils/api");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
      // Adicione outros métodos que você usa
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
  },
}));

const mockClientes = [
  {
    id: 1,
    nome: "Cliente1",
    cpf: "12345678901",
    telefone: "12345678901",
    email: "cliente1@teste.com",
    endereco: "Rua A, 123",
    cidade: "Cidade A",
    estado: "Estado A",
    cep: "12345678",
    bairro: "Bairro A",
    sexo: "M",
  },
  {
    id: 2,
    nome: "Cliente2",
    cpf: "98765432109",
    telefone: "98765432109",
    email: "cliente2@teste.com",
    endereco: "Rua B, 456",
    cidade: "Cidade B",
    estado: "Estado B",
    cep: "87654321",
    bairro: "Bairro B",
    sexo: "Feminino",
  },
];

describe("Componente Cliente", () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockClientes });
    (api.post as jest.Mock).mockResolvedValue({ data: { message: "Sucesso" } });
    (api.delete as jest.Mock).mockResolvedValue({
      data: { message: "Excluído" },
    });
  });

  test("Renderiza corretamente", async () => {
    render(<Cliente />);

    // Verifique o header
    expect(
      screen.getByRole("heading", {
        name: /Clientes/i,
        level: 4,
      })
    ).toBeInTheDocument();

    // Verifique o botão
    expect(
      screen.getByRole("button", { name: /novo cliente/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    const campoPesquisa = screen.getByPlaceholderText("Pesquisar clientes...");
    expect(campoPesquisa).toBeInTheDocument();
  });

  test("Carrega dados na inicialização", async () => {
    render(<Cliente />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/clientes");
    });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(mockClientes.length + 1); 
    });
  });

  test("Filtra dados corretamente", async () => {
    render(<Cliente />);

    const searchInput = screen.getByPlaceholderText("Pesquisar clientes...");
    fireEvent.change(searchInput, { target: { value: "Cliente1" } });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(2); 
    });
    await waitFor(() => {
      expect(screen.getByText("Cliente1")).toBeInTheDocument();
    });
  });

  test("Abre formulário para novo", async () => {
    render(<Cliente />);

    fireEvent.click(screen.getByText("Novo Cliente"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("Abre formulário para edição ao clicar em Editar", async () => {
    render(<Cliente />);

    // Espera os dados serem carregados
    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    // Encontra o primeiro botão Editar usando role
    const botoesEditar = await screen.findAllByRole("button", {
      name: /editar/i,
    });

    fireEvent.click(botoesEditar[0]);

    // Verifica se o modal/dialog foi aberto
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("Exclui cliente com confirmação", async () => {
    const clientes = [
      {
        id: 1,
        nome: "Cliente1",
        cpf: "12345678901",
        telefone: "12345678901",
        email: "cliente1@teste.com",
        endereco: "Rua A, 123",
        cidade: "Cidade A",
        estado: "Estado A",
        cep: "12345678",
        bairro: "Bairro A",
        sexo: "M",
      },
    ];

    // 2. Mock da API
    jest.spyOn(api, "get").mockResolvedValue({ data: clientes });

    render(<Cliente />);

    // 3. Aguarda carregamento
    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    // 4. Encontra e clica no botão
    const [botaoExcluir] = await screen.findAllByRole("button", {
      name: /excluir/i,
    });
    fireEvent.click(botaoExcluir);

    // 5. Verifica o modal
    const modal = await screen.findByRole("dialog");

    // 6. Verificações ajustadas
    await waitFor(() => {
      expect(modal).toHaveTextContent(/Confirmar Exclusão/i);
    });
    expect(modal).toHaveTextContent(clientes[0].nome);
  });

  test("Mostra erro ao carregar clientes", async () => {
    // 1. Mock da API para rejeitar
    (api.get as jest.Mock).mockRejectedValue(
      new Error("Erro desconhecido na API")
    );
  
    // 2. Renderize o componente
    render(<Cliente />);
  
    // 3. Verifique a chamada do toast SEM o segundo parâmetro
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Ocorreu um erro inesperado"); 
      },
      { timeout: 4000 }
    );
  });

});
