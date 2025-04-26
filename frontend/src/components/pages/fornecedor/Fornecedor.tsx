import { useState, useEffect, FC } from "react";
import { api } from "../../../utils/api";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IFornecedor } from "../../../interfaces/IFornecedor";
import { Button, Grid, TextField } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BoxCount from "../../components_ui/BoxCount";
import HeaderSection from "../../components_ui/HeaderSection";
import FornecedorFormulario from "./FornecedorFormulario";
import { AxiosError } from "axios";
import { ModalExclusao } from "../../components_ui/ModalExclusão";

const Fornecedor: FC = () => {
  const [abrirModalExclusao, setAbrirModalExclusao] = useState(false);
  const [fornecedores, setFornecedores] = useState<IFornecedor[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] =
    useState<IFornecedor | null>(null);
  const [abrirFormulario, setAbrirFormulario] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
      
    }
  };

  const novoFornecedor = () => {
    setFornecedorSelecionado(null);
    setAbrirFormulario(true);
  };

  const editarFornecedor = (id: number) => {
    const fornecedorParaEditar = fornecedores.find(
      (fornecedore: IFornecedor) => fornecedore.id === id
    );
    setFornecedorSelecionado(fornecedorParaEditar ?? null);
    setAbrirFormulario(true);
  };

  const carregarFornecedores = async () => {
    try {
      const response = await api.get<IFornecedor[]>("/fornecedores");
      setFornecedores(response.data);
    } catch (error) {
      // handleApiError(error);
      toast.error("Ocorreu um erro inesperado");
    }
  };

  useEffect(() => {
    carregarFornecedores();
  }, []);

  const filtrarFornecedores = (
    fornecedores: unknown,
    searchTerm: string
  ): IFornecedor[] => {
    if (!Array.isArray(fornecedores)) {
      return [];
    }
    const listaFornecedores = fornecedores as IFornecedor[];

    if (!searchTerm.trim()) {
      return listaFornecedores;
    }

    const termoBusca = searchTerm.toLowerCase();

    return listaFornecedores.filter((fornecedor) =>
      fornecedor.nome.toLowerCase().includes(termoBusca)
    );
  };

  const selecionarFornecedorDeleteAbriModal = (id: number) => {
    const fornecedor = fornecedores.find((fornecedor) => fornecedor.id === id);
    if (fornecedor) {
      setFornecedorSelecionado(fornecedor);
      setAbrirModalExclusao(true);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      if (fornecedorSelecionado && fornecedorSelecionado.id) {
        await handleDelete(fornecedorSelecionado.id);
        setAbrirModalExclusao(false);
        setFornecedorSelecionado(null);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/fornecedores/remove/${id}`);
      toast.success(response.data.message);
      toast.success("Fornecedor excluído com sucesso!");
      setAbrirModalExclusao(false);
      carregarFornecedores();
    } catch (error: any) {
      handleApiError(error);
      
    }
  };

  const handleSubmit = async (fornecedor: IFornecedor) => {
      try {
        if (fornecedor.id) {
          const response = await api.post(
            `/fornecedores/update/${fornecedor.id}`,
            fornecedor
          );
          toast.success(response.data.message);
        } else {
          const response = await api.post("/fornecedores/create", fornecedor);
          toast.success(response.data.message);
        }
        carregarFornecedores();
        setAbrirFormulario(false);
      } catch (error: any) {
        handleApiError(error);
        setFornecedorSelecionado(null);
        
      }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "nome", headerName: "Nome", width: 150 },
        { field: "cnpj", headerName: "CPF", width: 150 },
        { field: "celular", headerName: "Celular", width: 200 },
        { field: "email", headerName: "Email", width: 200 },
    
        {
          field: "acoes",
          headerName: "Ações",
          width: 350,
          renderCell: (params: any) => (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => editarFornecedor(params.row.id)}
                style={{ marginRight: "15px" }}
              >
                Editar
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => selecionarFornecedorDeleteAbriModal(params.row.id)}
              >
                Excluir
              </Button>
            </>
          ),
        },
      ];
    
      const rows = filtrarFornecedores(fornecedores, searchTerm).map((fornecedor) => ({
        id: fornecedor.id,
        nome: fornecedor.nome,
        cnpj: fornecedor.cnpj,
        celular: fornecedor.celular,
        email: fornecedor.email,
      }));
    
      return (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <HeaderSection
                title="Fornecedores"
                buttonLabel="Novo Fornecedor"
                onButtonClick={() => novoFornecedor()}
              />
            </Grid>
            <Grid item xs={12}>
              <BoxCount
                title="Fornecedores"
                count={fornecedores.length}
                icon={PeopleIcon}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Pesquisar fornecedores..."
                placeholder="Pesquisar fornecedores..."
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
          <FornecedorFormulario
            selecionado={fornecedorSelecionado}
            abrirFormulario={abrirFormulario}
            fecharFormulario={() => setAbrirFormulario(false)}
            salvar={handleSubmit}
          />
          <ModalExclusao
            abrirModal={abrirModalExclusao}
            fecharModal={() => setAbrirModalExclusao(false)}
            confirmarExclusao={handleConfirmarExclusao}
            nomeItemASerExcluido={
                fornecedorSelecionado?.nome ?? "Fornecedor não identificado"
            }
            mensagemComplementar="o fornecedor"
          />
        </>
      );
};

export default Fornecedor;
