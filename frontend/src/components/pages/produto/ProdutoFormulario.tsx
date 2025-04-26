import React, { useEffect, useState, FC } from "react";
import { toast } from "react-toastify";
import { IProduto } from "../../../interfaces/IProduto";
import { IFornecedor } from "../../../interfaces/IFornecedor";
import axios, { AxiosError } from "axios";
import { GenericSelect } from "../../components_html/GenericSelect";
import { api } from "../../../utils/api";
import { NumericFormat } from "react-number-format";
import { SelectChangeEvent } from "@mui/material/Select";
import { ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Grid,
  DialogActions,
  Button,
} from "@mui/material";

interface ProdutoFormularioProps {
  selecionado: IProduto | null;
  abrirFormulario: boolean;
  fecharFormulario: () => void;
  salvar: (produto: IProduto) => Promise<void>;
}

const initialProdutoState: IProduto = {
  id: undefined,
  nome: "",
  preco: 0,
  estoque: 0,
  fornecedor_fk: 0,
};

interface CurrencyInputProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: string | number;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onChange, ...props }, ref) => {
    return (
      <NumericFormat
        {...props}
        getInputRef={ref}
        onValueChange={(values) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={2}
        fixedDecimalScale
        allowNegative={false}
        prefix="R$ "
      />
    );
  }
);

const ProdutoFormulario: FC<ProdutoFormularioProps> = ({
  selecionado,
  abrirFormulario,
  fecharFormulario,
  salvar,
}) => {
  const [produto, setProduto] = useState<IProduto>(initialProdutoState);
  const [fornecedores, setFornecedores] = useState<IFornecedor[]>([]);
  
  const handleApiError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data;
      toast.error(serverError?.message || "Erro desconhecido na API");
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Ocorreu um erro inesperado");
    }
  };

  useEffect(() => {
    if (selecionado) {
      setProduto(selecionado);
    } else {
      setProduto(initialProdutoState);
    }
  }, [selecionado]);

  const handleChange = (
    event:
      | SelectChangeEvent<unknown>
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>& {
        target: {
          name: string;
          value: string;
        };
      }
  ) => {
    const { name, value } = event.target;
    setProduto((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await salvar(produto);
      fecharFormulario();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
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

  return (
    <Dialog
      open={abrirFormulario}
      onClose={fecharFormulario}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {selecionado?.id ? "Editar Produto" : "Novo Produto"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome"
                name="nome"
                value={produto.nome}
                onChange={handleChange}
                fullWidth
                // required
              />
            </Grid>
            <GenericSelect
              options={fornecedores}
              valueKey="id"
              labelKey="nome"
              selectedValue={produto.fornecedor_fk}
              onChange={handleChange}
              label="Fornecedores"
              name="fornecedor_fk"
              required={true}
              gridSize={12}
            />
            <Grid item xs={6}>
              <TextField
                label="Preço"
                name="preco"
                value={produto.preco}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  inputComponent: CurrencyInput as any,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Quantidade em Estoque"
                name="estoque"
                value={produto.estoque}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>
          <DialogActions sx={{ mt: 2 }}>
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

export default ProdutoFormulario;
