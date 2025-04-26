// npm test -- Usuario.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Usuario from "./Usuario";
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

const mockUsuarios = [
  {
    id: 1,
    login: "usuario1",
    email: "usuario1@teste.com",
    nivel_acesso: "admin",
    senha: "hash123",
  },
  {
    id: 2,
    login: "usuario2",
    email: "usuario2@teste.com",
    nivel_acesso: "user",
    senha: "hash456",
  },
];

describe("Componente Usuario", () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockUsuarios });
    (api.post as jest.Mock).mockResolvedValue({ data: { message: "Sucesso" } });
    (api.delete as jest.Mock).mockResolvedValue({
      data: { message: "Excluído" },
    });
  });

  test("Renderiza corretamente", async () => {
    render(<Usuario />);

    // Verifique o header
    expect(
      screen.getByRole("heading", {
        name: /Usuários/i,
        level: 4,
      })
    ).toBeInTheDocument();

    // Verifique o botão
    expect(
      screen.getByRole("button", { name: /novo usuário/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    const campoPesquisa = screen.getByPlaceholderText("Pesquisar usuários...");
    expect(campoPesquisa).toBeInTheDocument();
  });

  test("Carrega dados na inicialização", async () => {
    render(<Usuario />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/usuarios");
    });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(mockUsuarios.length + 1); // +1 para header
    });
  });

  test("Filtra dados corretamente", async () => {
    render(<Usuario />);

    const searchInput = screen.getByPlaceholderText("Pesquisar usuários...");
    fireEvent.change(searchInput, { target: { value: "usuario1" } });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(2);
    });
    await waitFor(() => {
      expect(screen.getByText("usuario1")).toBeInTheDocument();
    });
  });

  test("Abre formulário para novo", async () => {
    render(<Usuario />);

    fireEvent.click(screen.getByText("Novo Usuário"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("Abre formulário para edição ao clicar em Editar", async () => {
    render(<Usuario />);

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

  test("Exclui dado com confirmação", async () => {
    // 1. Mock dos dados ATUALIZADO
    const usuarios = [
      {
        id: 1,
        login: "usuario1",
        email: "teste@exemplo.com",
        nivel_acesso: "admin",
      },
    ];

    // 2. Mock da API
    jest.spyOn(api, "get").mockResolvedValue({ data: usuarios });

    render(<Usuario />);

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
    expect(modal).toHaveTextContent(usuarios[0].login);
  });
  
  test("Mostra erro ao carregar usuários", async () => {
    // 1. Mock da API para rejeitar
    (api.get as jest.Mock).mockRejectedValue(
      new Error("Erro desconhecido na API")
    );
  
    // 2. Renderize o componente
    render(<Usuario />);
  
    // 3. Verifique a chamada do toast SEM o segundo parâmetro
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Ocorreu um erro inesperado"); 
      },
      { timeout: 4000 }
    );
  });
});
