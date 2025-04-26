// npm test -- Produto.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Produto from "./Produto";
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

const mockProdutos = [
  {
    id: 1,
    nome: "Produto1",
    preco: 10.99,
    estoque: 100,
    fornecedor: "Fornecedor1",
  },
  {
    id: 2,
    nome: "Produto2",
    preco: 20.99,
    estoque: 200,
    fornecedor: "Fornecedor2",
  },
];

describe("Componente Produto", () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockProdutos });
    (api.post as jest.Mock).mockResolvedValue({ data: { message: "Sucesso" } });
    (api.delete as jest.Mock).mockResolvedValue({
      data: { message: "Excluído" },
    });
  });

  test("Renderiza corretamente", async () => {
    render(<Produto />);

    // Verifique o header
    expect(
      screen.getByRole("heading", {
        name: /Produtos/i,
        level: 4,
      })
    ).toBeInTheDocument();

    // Verifique o botão
    expect(
      screen.getByRole("button", { name: /novo produto/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    const campoPesquisa = screen.getByPlaceholderText("Pesquisar produtos...");
    expect(campoPesquisa).toBeInTheDocument();
  });

  test("Carrega dados na inicialização", async () => {
    render(<Produto />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/produtos");
    });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(mockProdutos.length + 1);
    });
  });

  test("Filtra dados corretamente", async () => {
    render(<Produto />);

    const searchInput = screen.getByPlaceholderText("Pesquisar produtos...");
    fireEvent.change(searchInput, { target: { value: "Produto1" } });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(2);
    });
    await waitFor(() => {
      expect(screen.getByText("Produto1")).toBeInTheDocument();
    });
  });

  test("Abre formulário para novo", async () => {
    render(<Produto />);

    fireEvent.click(screen.getByText("Novo Produto"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("Abre formulário para edição ao clicar em Editar", async () => {
    render(<Produto />);

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

  test("Exclui produto com confirmação", async () => {
    const produtos = [
      {
        id: 1,
        nome: "Produto1",
        preco: 10.99,
        estoque: 100,
        // fornecedor: { nome: "Fornecedor1" },
        fornecedor_fk: "1",
      },
    ];

    // 2. Mock da API
    jest.spyOn(api, "get").mockResolvedValue({ data: produtos });

    render(<Produto />);

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
    expect(modal).toHaveTextContent(produtos[0].nome);
  });

  test("Mostra erro ao carregar produtos", async () => {
    // 1. Mock da API para rejeitar
    (api.get as jest.Mock).mockRejectedValue(
      new Error("Erro desconhecido na API")
    );

    // 2. Renderize o componente
    render(<Produto />);

    // 3. Verifique a chamada do toast SEM o segundo parâmetro
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Ocorreu um erro inesperado");
      },
      { timeout: 4000 }
    );
  });
});
