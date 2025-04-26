import React, { useEffect, useState, FC } from "react";
import { toast } from "react-toastify";
import { IFornecedor } from "../../../interfaces/IFornecedor";
import StatusSelect from "../../components_html/StatusSelect";
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
  TelefoneInput,
  CelularInput,
  EmailInput,
  CnpjInput,
} from "../../../validacaoCampos/ValidacaoCampos";

interface FornecedorFormularioProps {
  selecionado: IFornecedor | null;
  abrirFormulario: boolean;
  fecharFormulario: () => void;
  salvar: (fornecedor: IFornecedor) => Promise<void>;
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

const initialFornecedorState: IFornecedor = {
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
  cnpj: "",
  status: "",
};
const FornecedorFormulario: FC<FornecedorFormularioProps> = ({
  selecionado,
  abrirFormulario,
  fecharFormulario,
  salvar,
}) => {
  const [fornecedor, setFornecedor] = useState<IFornecedor>(
    initialFornecedorState
  );
  const [error, setError] = useState<boolean>(false);

  const renderListaEstados = () => {
    return siglasEstados.map((estado) => (
      <MenuItem key={estado} value={estado} sx={{ textTransform: "uppercase" }}>
        {estado}
      </MenuItem>
    ));
  };

  const handleSelectChange = (e: { target: { value: string } }) => {
    setFornecedor((prev) => ({ ...prev, uf: e.target.value }));
  };

  useEffect(() => {
    if (selecionado) {
      setFornecedor(selecionado);
    } else {
      setFornecedor(initialFornecedorState);
    }
    if (!fornecedor.status) {
      setError(true);
      return;
    }
  }, [selecionado]);

  useEffect(() => {
    if (fornecedor.status) {
      setError(false);
    }
  }, [fornecedor.status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> & {
      target: {
        name: string;
        value: string;
      };
    }
  ) => {
    const { name, value } = e.target;
    setFornecedor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await salvar(fornecedor);
      fecharFormulario();
    } catch (error) {
      toast.error("Erro ao salvar fornecedor");
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
        {selecionado?.id ? "Editar Fornecedor" : "Novo Fornecedor"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome"
                name="nome"
                value={fornecedor.nome}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                label="Endereço"
                name="endereco"
                value={fornecedor.endereco}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Bairro"
                name="bairro"
                value={fornecedor.bairro}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                label="Cidade"
                name="cidade"
                value={fornecedor.cidade}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth required>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={fornecedor.uf}
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
                name="cep"
                label="CEP"
                fullWidth
                value={fornecedor.cep}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TelefoneInput
                name="telefone"
                label="Telefone"
                fullWidth
                value={fornecedor.telefone || ""}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <CelularInput
                label="Celular"
                name="celular"
                value={fornecedor.celular || ""}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={7}>
              <EmailInput
                name="email"
                label="Email"
                fullWidth
                value={fornecedor.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={5}>
              <CnpjInput
                name="cnpj"
                label="CNPJ"
                fullWidth
                value={fornecedor.cnpj}
                onChange={handleChange}
              />
            </Grid>
            <StatusSelect
              value={fornecedor.status}
              onChange={handleChange}
              error={error}
              helperText="Selecione uma opção"
              name="status"
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

export default FornecedorFormulario;
