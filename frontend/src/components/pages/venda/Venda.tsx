import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState, useEffect, FC } from "react";
import { api } from "../../../utils/api";
import {
  DataGrid,
  GridRenderCellParams,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IVenda } from "../../../interfaces/IVenda";
import { Button, Grid, TextField } from "@mui/material";
import BoxCount from "../../components_ui/BoxCount";
import HeaderSection from "../../components_ui/HeaderSection";
import VendaFormulario from "./VendaFormulario";
import { AxiosError } from "axios";
import { ModalExclusao } from "../../components_ui/ModalExclusão";
import { NumericFormat } from "react-number-format";
const Venda: FC = () => {
  const [abrirModalExclusao, setAbrirModalExclusao] = useState<boolean>(false);
  const [vendas, setVendas] = useState<IVenda[]>([]);
  // console.log("vendas", vendas);
  const [vendaSelecionado, setVendaSelecionado] = useState<IVenda | null>(null);
  // console.log("vendaSelecionado", vendaSelecionado);
  const [abrirFormulario, setAbrirFormulario] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  interface VendaRow extends GridValidRowModel {
    id: number;
    cliente_fk: string;
    produto_fk: string;
    // valor_pago: number;
    // quantidade: number;
    // forma_pagamento: string;
    produto?: {
      id: number;
      nome: string;
    };
    cliente?: {
      id: number;
      nome: string;
    };
  }

  interface ErrorResponse {
    message: string;
    // Adicione outras propriedades conforme a resposta da sua API
  }

  const handleApiError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const serverError = error.response?.data as ErrorResponse;
      toast.error(serverError?.message || "Erro desconhecido na API");
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Ocorreu um erro inesperado");
    }
  };

  const novoVenda = () => {
    setVendaSelecionado(null);
    setAbrirFormulario(true);
  };

  const editarVenda = (id: number) => {
    const vendaParaEditar = vendas.find((venda: IVenda) => venda.id === id);
    setVendaSelecionado(vendaParaEditar ?? null);
    setAbrirFormulario(true);
  };

  const carregarVendas = async () => {
    try {
      const response = await api.get<IVenda[]>("/vendas");
      setVendas(response.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    carregarVendas();
  }, []);

  const filtrarVendas = (vendas: unknown, searchTerm: string): IVenda[] => {
    if (!Array.isArray(vendas)) {
      return [];
    }
    const listaVendas = vendas as IVenda[];

    if (!searchTerm.trim()) {
      return listaVendas;
    }

    const termoBusca = searchTerm.toLowerCase();

    return listaVendas.filter(
      (venda) =>
        venda.cliente?.nome.toLowerCase().includes(termoBusca) ||
        venda.produto?.nome.toLowerCase().includes(termoBusca)
    );
  };

  const selecionarVendaDeleteAbriModal = (id: number) => {
    const venda = vendas.find((venda) => venda.id === id);
    if (venda) {
      setVendaSelecionado(venda);
      setAbrirModalExclusao(true);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      if (vendaSelecionado && vendaSelecionado.id) {
        await handleDelete(vendaSelecionado.id);
        setAbrirModalExclusao(false);
        setVendaSelecionado(null);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/vendas/remove/${id}`);
      toast.success(response.data.message);
      // toast.success("Venda excluído com sucesso!");
      setAbrirModalExclusao(false);
      carregarVendas();
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const handleSubmit = async (venda: IVenda) => {
    try {
      if (venda.id) {
        const response = await api.post(`/vendas/update/${venda.id}`, venda);
        toast.success(response.data.message);
      } else {
        const response = await api.post("/vendas/create", venda);
        toast.success(response.data.message);
      }
      carregarVendas();
      setAbrirFormulario(false);
    } catch (error: any) {
      handleApiError(error);
      setVendaSelecionado(null);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "cliente_fk", headerName: "Nome Cliente", width: 200 },
    { field: "produto_fk", headerName: "Produto", width: 200 },
    {
      field: "valor_pago",
      headerName: "Valor Pago",
      width: 150,
      renderCell: (params: GridRenderCellParams<VendaRow, number>) => (
        <NumericFormat
          value={params.value}
          displayType="text"
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
        />
      ),
    },
    { field: "quantidade", headerName: "Quantidade", width: 150 },
    { field: "forma_pagamento", headerName: "Forma de pagamento", width: 200 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 350,
      renderCell: (params: any) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => editarVenda(params.row.id)}
            style={{ marginRight: "15px" }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => selecionarVendaDeleteAbriModal(params.row.id)}
          >
            Excluir
          </Button>
        </>
      ),
    },
  ];

  const rows = filtrarVendas(vendas, searchTerm).map((venda) => ({
    id: Number(venda.id),
    cliente_fk: venda.cliente?.nome || venda.cliente_fk.toString(),
    valor_pago: venda.valor_pago,
    quantidade: venda.quantidade,
    produto_fk: venda.produto?.nome || venda.produto_fk.toString(),
    forma_pagamento: venda.forma_pagamento,
  }));

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HeaderSection
            title="Vendas"
            buttonLabel="Nova Venda"
            onButtonClick={novoVenda}
          />
        </Grid>
        <Grid item xs={12}>
          <BoxCount
            title="Total de Vendas"
            count={vendas.length}
            icon={ShoppingCartIcon}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Pesquisar"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <DataGrid rows={rows} columns={columns} checkboxSelection />
        </Grid>
      </Grid>
      <VendaFormulario
        selecionado={vendaSelecionado}
        abrirFormulario={abrirFormulario}
        fecharFormulario={() => setAbrirFormulario(false)}
        salvar={handleSubmit}
      />
      <ModalExclusao
        abrirModal={abrirModalExclusao}
        fecharModal={() => setAbrirModalExclusao(false)}
        confirmarExclusao={handleConfirmarExclusao}
        nomeItemASerExcluido={
          vendaSelecionado?.cliente?.nome ?? "Venda não identificado"
        }
        mensagemComplementar="a venda do cliente"
      />
    </>
  );
};

export default Venda;
