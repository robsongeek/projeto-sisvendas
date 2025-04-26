// npm test -- Fornecedor.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Fornecedor from "./Fornecedor";
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
        nome: "Fornecedor1", 
        endereco: "Distrito Industrial, 245", 
        bairro: "Centro", 
        cep: "35687909", 
        cnpj: "463.456.789-77", 
        telefone: "23763478", 
        celular: "91988885555", 
        email: "fornecedor1@teste.com", 
        status: "A", 
        cidade:"São Paulo",
        uf:"SP"
    },
    {
        id: 2,
        nome: "Fornecedor2", 
        endereco: "Distrito Industrial, 245", 
        bairro: "Centro", 
        cep: "35687909", 
        cnpj: "463.456.789-77", 
        telefone: "23763478", 
        celular: "91988885555", 
        email: "fornecedor2@teste.com", 
        status: "A", 
        cidade:"São Paulo",
        uf:"SP"
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
    render(<Fornecedor />);

    // Verifique o header
    expect(
      screen.getByRole("heading", {
        name: /Fornecedores/i,
        level: 4,
      })
    ).toBeInTheDocument();

    // Verifique o botão
    expect(
      screen.getByRole("button", { name: /novo fornecedor/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    const campoPesquisa = screen.getByPlaceholderText("Pesquisar fornecedores...");
    expect(campoPesquisa).toBeInTheDocument();
  });

  test("Carrega dados na inicialização", async () => {
    render(<Fornecedor />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/fornecedores");
    });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(mockClientes.length + 1); 
    });
  });

  test("Filtra dados corretamente", async () => {
    render(<Fornecedor />);

    const searchInput = screen.getByPlaceholderText("Pesquisar fornecedores...");
    fireEvent.change(searchInput, { target: { value: "Fornecedor1" } });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(2); 
    });
    await waitFor(() => {
      expect(screen.getByText("Fornecedor1")).toBeInTheDocument();
    });
  });

  test("Abre formulário para novo", async () => {
    render(<Fornecedor />);

    fireEvent.click(screen.getByText("Novo Fornecedor"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("Abre formulário para edição ao clicar em Editar", async () => {
    render(<Fornecedor />);

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

  test("Exclui usuário com confirmação", async () => {
    const fornecedores = [
        {
            id: 1,
            nome: "Fornecedor1", 
            endereco: "Distrito Industrial, 245", 
            bairro: "Centro", 
            cep: "35687909", 
            cnpj: "463.456.789-77", 
            telefone: "23763478", 
            celular: "91988885555", 
            email: "fornecedor1@teste.com", 
            status: "A", 
            cidade:"São Paulo",
            uf:"SP"
        },
    ];

    // 2. Mock da API
    jest.spyOn(api, "get").mockResolvedValue({ data: fornecedores });

    render(<Fornecedor />);

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
    expect(modal).toHaveTextContent(fornecedores[0].nome);
  });

  test("Mostra erro ao carregar fornecedores", async () => {
    // 1. Mock da API para rejeitar
    (api.get as jest.Mock).mockRejectedValue(
      new Error("Erro desconhecido na API")
    );
  
    // 2. Renderize o componente
    render(<Fornecedor />);
  
    // 3. Verifique a chamada do toast SEM o segundo parâmetro
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Ocorreu um erro inesperado"); 
      },
      { timeout: 4000 }
    );
  });
});
