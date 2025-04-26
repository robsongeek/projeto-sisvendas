import { useState, useEffect, FC } from "react";
import { api } from "../../../utils/api";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IUsuario } from "../../../interfaces/IUsuario";
import { Button, Grid, TextField } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BoxCount from "../../components_ui/BoxCount";
import HeaderSection from "../../components_ui/HeaderSection";
import UsuarioFormulario from "./UsuarioFromulario";
import axios, { AxiosError } from "axios";
import { ModalExclusao } from "../../components_ui/ModalExclusão";

const Usuario: FC = () => {
  const [abrirModalExclusao, setAbrirModalExclusao] = useState(false);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<IUsuario | null>(
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
      toast.error(serverError.message || "Erro desconhecido na API");
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Ocorreu um erro inesperado",);
    }
  };

  const novoUsuario = () => {
    setUsuarioSelecionado(null);
    setAbrirFormulario(true);
  };

  const editarUsuario = (id: number) => {
    const usuarioParaEditar = usuarios.find(
      (usuario: IUsuario) => usuario.id === id
    );
    setUsuarioSelecionado(usuarioParaEditar ?? null);
    setAbrirFormulario(true);
  };

  const carregarUsuarios = async () => {
    try {
      const response = await api.get<IUsuario[]>("/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      // handleApiError(error);
      toast.error("Ocorreu um erro inesperado",);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const filtrarUsuarios = (
    usuarios: unknown,
    searchTerm: string
  ): IUsuario[] => {
    if (!Array.isArray(usuarios)) {
      return [];
    }

    const listaUsuarios = usuarios as IUsuario[];

    if (!searchTerm.trim()) {
      return listaUsuarios;
    }

    const termoBusca = searchTerm.toLowerCase();

    return listaUsuarios.filter((usuario) =>
      usuario.login.toLowerCase().includes(termoBusca)
    );
  };

  const selecionarUsuarioDeleteAbriModal = (id: number) => {
    const usuario = usuarios.find((user) => user.id === id);
    if (usuario) {
      setUsuarioSelecionado(usuario);
      setAbrirModalExclusao(true);
    }
  };

  const handleConfirmarExclusao = async () => {
    try {
      if (usuarioSelecionado && usuarioSelecionado.id) {
        await handleDelete(usuarioSelecionado.id);
        setAbrirModalExclusao(false);
        setUsuarioSelecionado(null);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/usuarios/remove/${id}`);
      toast.success(response.data.message);
      setAbrirModalExclusao(false);
      carregarUsuarios();
    } catch (error: any) {
      handleApiError(error);
      // toast.error(error.response.data.message);
      // toast.error(error.message);
    }
  };

  const handleSubmit = async (usuario: IUsuario) => {
    try {
      if (usuario.id) {
        const response = await api.post(
          `/usuarios/update/${usuario.id}`,
          usuario
        );
        toast.success(response.data.message);
      } else {
        const response = await api.post("/usuarios/create", usuario);
        toast.success(response.data.message);
      }
      carregarUsuarios();
      setAbrirFormulario(false);
    } catch (error: any) {
      handleApiError(error);
      setUsuarioSelecionado(null);
      // toast.error(error.response.data.message);
      // toast.error(error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "login", headerName: "Login", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "nivel_acesso", headerName: "Nivel de acesso", width: 150 },
    {
      field: "acoes",
      headerName: "Ações",
      width: 350,
      renderCell: (params: any) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => editarUsuario(params.row.id)}
            style={{ marginRight: "15px" }}
          >
            Editar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => selecionarUsuarioDeleteAbriModal(params.row.id)}
          >
            Excluir
          </Button>
        </>
      ),
    },
  ];

  const rows = filtrarUsuarios(usuarios, searchTerm).map((usuario) => ({
    id: usuario.id,
    login: usuario.login,
    email: usuario.email,
    nivel_acesso: usuario.nivel_acesso,
  }));

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <HeaderSection
            title="Usuários"
            buttonLabel="Novo Usuário"
            onButtonClick={() => novoUsuario()}
          />
        </Grid>
        <Grid item xs={12}>
          <BoxCount
            title="Usuários"
            count={usuarios.length}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            label="Pesquisar usuários..."
            placeholder="Pesquisar usuários..."
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
      <UsuarioFormulario
        selecionado={usuarioSelecionado}
        abrirFormulario={abrirFormulario}
        fecharFormulario={() => setAbrirFormulario(false)}
        salvar={handleSubmit}
      />

      <ModalExclusao
        abrirModal={abrirModalExclusao}
        fecharModal={() => setAbrirModalExclusao(false)}
        confirmarExclusao={handleConfirmarExclusao}
        nomeItemASerExcluido={
          usuarioSelecionado?.login ?? "Usuário não identificado"
        }
        mensagemComplementar="o usuário"
      />
    </>
  );
};

export default Usuario;
