// npm test -- Venda.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Venda from "./Venda";
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

const mockVendas = [
  {
    id: 1,
    data_venda: "2025-10-01",
    cliente_fk: 1,
    valor_total: 100.0,
    desconto: 10.0,
    valor_pago: 90.0,
    forma_pagamento: "Cartão",
    produto_fk: 1,
    vendedor_fk: 1,
    quantidade: 2,
  },
  {
    id: 1,
    data_venda: "2025-10-02",
    cliente_fk: 1,
    valor_total: 100.0,
    desconto: 10.0,
    valor_pago: 90.0,
    forma_pagamento: "Cartão",
    produto_fk: 1,
    vendedor_fk: 1,
    quantidade: 2,
  },
];

describe("Componente venda", () => {
  beforeEach(() => {
    (api.get as jest.Mock).mockResolvedValue({ data: mockVendas });
    (api.post as jest.Mock).mockResolvedValue({ data: { message: "Sucesso" } });
    (api.delete as jest.Mock).mockResolvedValue({
      data: { message: "Excluído" },
    });
  });

  test("Renderiza corretamente", async () => {
    render(<Venda />);

    // Verifique o header
    expect(
      screen.getByRole("heading", {
        name: /Vendas/i,
        level: 4,
      })
    ).toBeInTheDocument();

    // Verifique o botão
    expect(
      screen.getByRole("button", { name: /novo venda/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    const campoPesquisa = screen.getByPlaceholderText("Pesquisar vendas...");
    expect(campoPesquisa).toBeInTheDocument();
  });

  test("Carrega dados na inicialização", async () => {
    render(<Venda />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/vendas");
    });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(mockVendas.length + 1); 
    });
  });

  test("Filtra dados corretamente", async () => {
    render(<Venda />);

    const searchInput = screen.getByPlaceholderText("Pesquisar vendas...");
    fireEvent.change(searchInput, { target: { value: "Cliente1" } });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(2); 
    });
    await waitFor(() => {
      expect(screen.getByText("Cliente1")).toBeInTheDocument();
    });
  });

  test("Abre formulário para novo", async () => {
    render(<Venda />);

    fireEvent.click(screen.getByText("Novo Venda"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  test("Abre formulário para edição ao clicar em Editar", async () => {
    render(<Venda />);

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

  test("Exclui venda com confirmação", async () => {
    const vendas = [
      {
        id: 1,
    data_venda: "2025-10-01",
    cliente: "Cliente1",
    valor_total: 100.0,
    desconto: 10.0,
    valor_pago: 90.0,
    forma_pagamento: "Cartão",
    produto: "Produto1",
    vendedor: "Vendedor1",
    quantidade: 2,
      },
    ];

    // 2. Mock da API
    jest.spyOn(api, "get").mockResolvedValue({ data: vendas });

    render(<Venda />);

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
    expect(modal).toHaveTextContent(vendas[0].cliente);
  });

  test("Mostra erro ao carregar vendas", async () => {
    // 1. Mock da API para rejeitar
    (api.get as jest.Mock).mockRejectedValue(
      new Error("Erro desconhecido na API")
    );
  
    // 2. Renderize o componente
    render(<Venda />);
  
    // 3. Verifique a chamada do toast SEM o segundo parâmetro
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith("Ocorreu um erro inesperado"); 
      },
      { timeout: 4000 }
    );
  });

});
