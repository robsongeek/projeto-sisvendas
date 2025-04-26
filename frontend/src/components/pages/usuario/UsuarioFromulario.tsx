import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { IUsuario } from "../../../interfaces/IUsuario";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { EmailInput } from "../../../validacaoCampos/ValidacaoCampos";

interface UsuarioFormularioProps {
  selecionado: IUsuario | null;
  abrirFormulario: boolean;
  fecharFormulario: () => void;
  salvar: (usuario: IUsuario) => Promise<void>;
}

const initialUsuarioState: IUsuario = {
  id: undefined,
  login: "",
  email: "",
  nivel_acesso: "",
  senha: "",
  confirmacao_senha: "",
};

const UsuarioFormulario: React.FC<UsuarioFormularioProps> = ({
  selecionado,
  abrirFormulario,
  fecharFormulario,
  salvar,
}) => {
  const [usuario, setUsuario] = useState<IUsuario>(initialUsuarioState);
  // console.log("usuario", usuario);
  const niveisAcesso = ["admin", "user"];

  useEffect(() => {
    if (selecionado) {
      setUsuario(selecionado);
    } else {
      setUsuario(initialUsuarioState);
    }
  }, [selecionado]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> & {
      target: { name: string; value: string };
    }
  ) => {
    const { name, value } = e.target;
    setUsuario((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: { target: { value: string } }) => {
    setUsuario((prev) => ({ ...prev, nivel_acesso: e.target.value }));
  };

  const validateForm = (): boolean => {
    if (
      !usuario.login ||
      !usuario.email ||
      !usuario.nivel_acesso ||
      !usuario.senha ||
      !usuario.confirmacao_senha
    ) {
      toast.error("Preencha todos os campos");
      return false;
    }

    if (usuario.senha !== usuario.confirmacao_senha) {
      toast.error("As senhas não coincidem");
      return false;
    }

    if (usuario.senha.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!validateForm()) return;

    try {
      await salvar(usuario);
      fecharFormulario();
    } catch (error) {
      toast.error("Erro ao salvar usuário");
    }
  };

  const renderNiveisAcesso = () => {
    return niveisAcesso.map((nivel) => (
      <MenuItem key={nivel} value={nivel} sx={{ textTransform: "capitalize" }}>
        {nivel.toLowerCase()}
      </MenuItem>
    ));
  };

  return (
    <Dialog
      open={abrirFormulario}
      onClose={fecharFormulario}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {selecionado?.id ? "Editar Usuário" : "Novo Usuário"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Login"
                name="login"
                value={usuario.login}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <EmailInput
                label="E-mail"
                name="email"
                type="email"
                value={usuario.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Senha"
                name="senha"
                type="password"
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Confirmação de Senha"
                name="confirmacao_senha"
                type="password"
                value={usuario.confirmacao_senha}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Nível de Acesso</InputLabel>
                <Select
                  value={usuario.nivel_acesso}
                  onChange={handleSelectChange}
                  label="Nível de Acesso"
                  inputProps={{ name: "nivel_acesso" }}
                >
                  {renderNiveisAcesso()}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <DialogActions>
            <Button onClick={fecharFormulario}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {selecionado ? "Alterar" : "Salvar"}
            </Button>
          </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default UsuarioFormulario;
