import { useState, useEffect, FC } from "react";
import { api } from "../../../utils/api";
import { DataGrid, GridRenderCellParams, GridValidRowModel } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IProduto } from "../../../interfaces/IProduto";
import { Button, Grid, TextField } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BoxCount from "../../components_ui/BoxCount";
import HeaderSection from "../../components_ui/HeaderSection";
import ProdutoFormulario from "./ProdutoFormulario";
import axios, { AxiosError } from "axios";
import { ModalExclusao } from "../../components_ui/ModalExclusão";
import { NumericFormat } from 'react-number-format';
const Produto: FC = () => {
  const [abrirModalExclusao, setAbrirModalExclusao] = useState(false);
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  // console.log("produtos", produtos);
  const [produtoSelecionado, setProdutoSelecionado] = useState<IProduto | null>(
    null
  );
  const [abrirFormulario, setAbrirFormulario] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  interface ProdutoRow extends GridValidRowModel {
    id: number;
    preco: number;
    nome: string;
    estoque: number;
    fornecedor_fk: string;
    fornecedor?: {  
      id: number;
      nome: string;
    };
  }

  interface ErrorResponse {
    message: string;
    // Adicione outras propriedades conforme a resposta da sua API
  }

  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ErrorResponse;
      toast.error(serverError?.message || "Erro desconhecido na API");
      toast.error(error.message);
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Ocorreu um erro inesperado");
    }
  };

  const novoProduto = () => {
    setProdutoSelecionado(null);
    setAbrirFormulario(true);
  };

  const editarProduto = (id: number) => {
    const produtoParaEditar = produtos.find(
      (produto: IProduto) => produto.id === id
    );
    setProdutoSelecionado(produtoParaEditar ?? null);
    setAbrirFormulario(true);
  };

  const carregarProdutos = async () => {
    try {
      const response = await api.get<IProduto[]>("/produtos");
      setProdutos(response.data);
    } catch (error) {
      // handleApiError(error);
      toast.error("Ocorreu um erro inesperado");
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const filtrarProdutos = (
    produtos: unknown,
    searchTerm: string
  ): IProduto[] => {
    if (!Array.isArray(produtos)) {
      return [];
    }
    const listaProdutos = produtos as IProduto[];

    if (!searchTerm.trim()) {
      return listaProdutos;
    }

    const termoBusca = searchTerm.toLowerCase();

    return listaProdutos.filter((produto) =>
      produto.nome.toLowerCase().includes(termoBusca)
    );
  };

  const selecionarProdutoDeleteAbriModal = (id: number) => {
    const produto = produtos.find((produto) => produto.id === id);
    if (produto) {
      setProdutoSelecionado(produto);
      setAbrirModalExclusao(true);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      if (produtoSelecionado && produtoSelecionado.id) {
        await handleDelete(produtoSelecionado.id);
        setAbrirModalExclusao(false);
        setProdutoSelecionado(null);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/produtos/remove/${id}`);
      toast.success(response.data.message);
      toast.success("Produto excluído com sucesso!");
      setAbrirModalExclusao(false);
      carregarProdutos();
    } catch (error: any) {
      // handleApiError(error);
      toast.error("Ocorreu um erro inesperado");
    }
  };

  const handleSubmit = async (produto: IProduto) => {
    try {
      if (produto.id) {
        const response = await api.post(
          `/produtos/update/${produto.id}`,
          produto
        );
        toast.success(response.data.message);
      } else {
        const response = await api.post("/produtos/create", produto);
        toast.success(response.data.message);
      }
      carregarProdutos();
      setAbrirFormulario(false);
    } catch (error: any) {
      handleApiError(error);
      setProdutoSelecionado(null);
    }
  };
  
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nome", headerName: "Nome", width: 150 },
    {
      field: "preco",
      headerName: "Preço",
      width: 150,
      renderCell: (params: GridRenderCellParams<ProdutoRow, number>) => (
        <NumericFormat
          value={params.value}
          displayType="text"
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
        />
      )
    },
    { field: "estoque", headerName: "Quantidade", width: 200 },
    { field: "fornecedor_fk", headerName: "Fornecedor", width: 200 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 350,
      renderCell: (params: any) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => editarProduto(params.row.id)}
            style={{ marginRight: "15px" }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => selecionarProdutoDeleteAbriModal(params.row.id)}
          >
            Excluir
          </Button>
        </>
      ),
    },
  ];

  const rows = filtrarProdutos(produtos, searchTerm).map((produto) => ({
    id: Number(produto.id),
    nome: produto.nome,
    preco: produto.preco,
    estoque: produto.estoque,
    // fornecedor_fk: produto.fornecedor?.nome || produto.fornecedor_fk.toString(),
    fornecedor_fk: produto.fornecedor?.nome || "Fornecedor não encontrado",
  }));

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HeaderSection
            title="Produtos"
            buttonLabel="Novo Produto"
            onButtonClick={() => novoProduto()}
          />
        </Grid>
        <Grid item xs={12}>
          <BoxCount
            title="Produtos"
            count={produtos.length}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Pesquisar produtos..."
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <div>
            <DataGrid rows={rows} columns={columns} checkboxSelection />
          </div>
        </Grid>
      </Grid>
      <ProdutoFormulario
        selecionado={produtoSelecionado}
        abrirFormulario={abrirFormulario}
        fecharFormulario={() => setAbrirFormulario(false)}
        salvar={handleSubmit}
      />
      <ModalExclusao
        abrirModal={abrirModalExclusao}
        fecharModal={() => setAbrirModalExclusao(false)}
        confirmarExclusao={handleConfirmarExclusao}
        nomeItemASerExcluido={
          produtoSelecionado?.nome ?? "Produto não identificado"
        }
        mensagemComplementar="o produto"
      />
    </>
  );
};

export default Produto;
