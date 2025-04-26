import React, { useEffect, useState, FC } from "react";
import { toast } from "react-toastify";
import { ICliente } from "../../../interfaces/ICliente";
import GeneroSelect from "../../components_html/GenroSelect";
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

import {
  CepInput,
  CpfInput,
  TelefoneInput,
  CelularInput,
  EmailInput,
  CnpjInput,
} from "../../../validacaoCampos/ValidacaoCampos";

interface ClienteFormularioProps {
  selecionado: ICliente | null;
  abrirFormulario: boolean;
  fecharFormulario: () => void;
  salvar: (cliente: ICliente) => Promise<void>;
}

const siglasEstados: string[] = [
  "AC", // Acre
  "AL", // Alagoas
  "AP", // Amapá
  "AM", // Amazonas
  "BA", // Bahia
  "CE", // Ceará
  "DF", // Distrito Federal
  "ES", // Espírito Santo
  "GO", // Goiás
  "MA", // Maranhão
  "MT", // Mato Grosso
  "MS", // Mato Grosso do Sul
  "MG", // Minas Gerais
  "PA", // Pará
  "PB", // Paraíba
  "PR", // Paraná
  "PE", // Pernambuco
  "PI", // Piauí
  "RJ", // Rio de Janeiro
  "RN", // Rio Grande do Norte
  "RS", // Rio Grande do Sul
  "RO", // Rondônia
  "RR", // Roraima
  "SC", // Santa Catarina
  "SP", // São Paulo
  "SE", // Sergipe
  "TO", // Tocantins
];

const initialClienteState: ICliente = {
  id: undefined,
  nome: "",
  endereco: "",
  bairro: "",
  cidade: "",
  uf: "",
  cep: "",
  telefone: "",
  celular: "",
  email: "",
  cpf: "",
  sexo: "",
};

const UsuarioFormulario: FC<ClienteFormularioProps> = ({
  selecionado,
  abrirFormulario,
  fecharFormulario,
  salvar,
}) => {
  const [cliente, setCliente] = useState<ICliente>(initialClienteState);
  // console.log("cliente", cliente);
  const [error, setError] = useState<boolean>(false);

  const renderListaEstados = () => {
    return siglasEstados.map((estado) => (
      <MenuItem key={estado} value={estado} sx={{ textTransform: "uppercase" }}>
        {estado}
      </MenuItem>
    ));
  };

  const handleSelectChange = (e: { target: { value: string } }) => {
    setCliente((prev) => ({ ...prev, uf: e.target.value }));
  };

  useEffect(() => {
    if (selecionado) {
      setCliente(selecionado);
    } else {
      setCliente(initialClienteState);
    }
    if (!cliente.sexo) {
      setError(true);
      return;
    }
  }, [selecionado]);

  useEffect(() => {
    if (cliente.sexo) {
      setError(false);
    }
  }, [cliente.sexo]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> & {
      target: {
        name: string;
        value: string;
      };
    }
  ) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await salvar(cliente);
      fecharFormulario();
    } catch (error) {
      toast.error("Erro ao salvar cliente");
    }
  };

  return (
    <Dialog
      open={abrirFormulario}
      onClose={fecharFormulario}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {selecionado?.id ? "Editar Cliente" : "Novo Cliente"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome"
                name="nome"
                value={cliente.nome}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Endereço"
                name="endereco"
                value={cliente.endereco}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Bairro"
                name="bairro"
                value={cliente.bairro}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="Cidade"
                name="cidade"
                value={cliente.cidade}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth required>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={cliente.uf}
                  onChange={handleSelectChange}
                  label="Estado"
                  inputProps={{ name: "uf" }}
                >
                  {renderListaEstados()}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <CepInput
                label="CEP"
                name="cep"
                value={cliente.cep}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TelefoneInput
                label="Telefone"
                name="telefone"
                value={cliente.telefone || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <CelularInput
                label="Celular"
                name="celular"
                value={cliente.celular || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <EmailInput
                label="E-mail"
                name="email"
                type="email"
                value={cliente.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <CpfInput
                label="CPF"
                name="cpf"
                value={cliente.cpf || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <GeneroSelect
              value={cliente.sexo}
              onChange={handleChange}
              error={error}
              helperText="Selecione uma opção"
              name="sexo"
            />
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
