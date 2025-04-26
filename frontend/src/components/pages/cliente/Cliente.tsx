import { useState, useEffect, FC } from "react";
import { api } from "../../../utils/api";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ICliente } from "../../../interfaces/ICliente";
import { Button, Grid, TextField } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BoxCount from "../../components_ui/BoxCount";
import HeaderSection from "../../components_ui/HeaderSection";
import ClienteFormulario from "./ClienteFormulario";
import axios, { AxiosError } from "axios";
import { ModalExclusao } from "../../components_ui/ModalExclusão";

const Cliente: FC = () => {
  const [abrirModalExclusao, setAbrirModalExclusao] = useState(false);
  const [clientes, setclientes] = useState<ICliente[]>([]);
  // console.log("clientes", clientes);
  const [clienteSelecionado, setClienteSelecionado] = useState<ICliente | null>(
    null
  );
  const [abrirFormulario, setAbrirFormulario] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  interface ErrorResponse {
    message: string;
    // Adicione outras propriedades conforme a resposta da sua API
  }
  

  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ErrorResponse;
      toast.error(serverError?.message || "Erro desconhecido na API");
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Ocorreu um erro inesperado");
    }
  };

  const novoCliente = () => {
    setClienteSelecionado(null);
    setAbrirFormulario(true);
  };

  const editarCliente = (id: number) => {
    const clienteParaEditar = clientes.find(
      (cliente: ICliente) => cliente.id === id
    );
    setClienteSelecionado(clienteParaEditar ?? null);
    setAbrirFormulario(true);
  };

  const carregarClientes = async () => {
    try {
      const response = await api.get<ICliente[]>("/clientes");
      setclientes(response.data);
    } catch (error) {
      // handleApiError(error);
      toast.error("Ocorreu um erro inesperado");
    }
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const filtrarClientes = (
    clientes: unknown,
    searchTerm: string
  ): ICliente[] => {
    if (!Array.isArray(clientes)) {
      return [];
    }

    const listaclientes = clientes as ICliente[];

    if (!searchTerm.trim()) {
      return listaclientes;
    }

    const termoBusca = searchTerm.toLowerCase();

    return listaclientes.filter((cliente) =>
      cliente.nome.toLowerCase().includes(termoBusca)
    );
  };

  const selecionarClienteDeleteAbriModal = (id: number) => {
    const cliente = clientes.find((cliente) => cliente.id === id);
    if (cliente) {
      setClienteSelecionado(cliente);
      setAbrirModalExclusao(true);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      if (clienteSelecionado && clienteSelecionado.id) {
        await handleDelete(clienteSelecionado.id);
        setAbrirModalExclusao(false);
        setClienteSelecionado(null);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/clientes/remove/${id}`);
      toast.success(response.data.message);
      setAbrirModalExclusao(false);
      carregarClientes();
    } catch (error: any) {
      handleApiError(error);
      // toast.error(error.response.data.message);
      // toast.error(error.message);
    }
  };

  const handleSubmit = async (cliente: ICliente) => {
    try {
      if (cliente.id) {
        const response = await api.post(
          `/clientes/update/${cliente.id}`,
          cliente
        );
        toast.success(response.data.message);
      } else {
        const response = await api.post("/clientes/create", cliente);
        toast.success(response.data.message);
      }
      carregarClientes();
      setAbrirFormulario(false);
    } catch (error: any) {
      handleApiError(error);
      setClienteSelecionado(null);
      // toast.error(error.response.data.message);
      // toast.error(error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nome", headerName: "Nome", width: 150 },
    { field: "cpf", headerName: "CPF", width: 150 },
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
            onClick={() => editarCliente(params.row.id)}
            style={{ marginRight: "15px" }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => selecionarClienteDeleteAbriModal(params.row.id)}
          >
            Excluir
          </Button>
        </>
      ),
    },
  ];

  const rows = filtrarClientes(clientes, searchTerm).map((cliente) => ({
    id: cliente.id,
    nome: cliente.nome,
    cpf: cliente.cpf,
    celular: cliente.celular,
    email: cliente.email,
  }));

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HeaderSection
            title="Clientes"
            buttonLabel="Novo Cliente"
            onButtonClick={() => novoCliente()}
          />
        </Grid>
        <Grid item xs={12}>
          <BoxCount
            title="Clientes"
            count={clientes.length}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Pesquisar clientes..."
            placeholder="Pesquisar clientes..."
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
      <ClienteFormulario
        selecionado={clienteSelecionado}
        abrirFormulario={abrirFormulario}
        fecharFormulario={() => setAbrirFormulario(false)}
        salvar={handleSubmit}
      />
      <ModalExclusao
        abrirModal={abrirModalExclusao}
        fecharModal={() => setAbrirModalExclusao(false)}
        confirmarExclusao={handleConfirmarExclusao}
        nomeItemASerExcluido={
          clienteSelecionado?.nome ?? "Cliente não identificado"
        }
        mensagemComplementar="o cliente"
      />
    </>
  );
};

export default Cliente;
