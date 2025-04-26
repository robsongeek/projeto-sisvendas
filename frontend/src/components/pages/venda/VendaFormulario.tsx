import React, { useEffect, useState, FC } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { ptBR } from "date-fns/locale";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IVenda } from "../../../interfaces/IVenda";
import { IProduto } from "../../../interfaces/IProduto";
import { ICliente } from "../../../interfaces/ICliente";
import { IUsuario } from "../../../interfaces/IUsuario";
import { AxiosError } from "axios";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const forma_pagamento: string[] = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Pix",
  "Transferência Bancária",
];

const renderFormaPagamento = () => {
  return forma_pagamento.map((pagamento) => (
    <MenuItem
      key={pagamento}
      value={pagamento}
      sx={{ textTransform: "capitalize" }}
    >
      {pagamento}
    </MenuItem>
  ));
};

interface VendaFormularioProps {
  selecionado: IVenda | null;
  abrirFormulario: boolean;
  fecharFormulario: () => void;
  salvar: (venda: IVenda) => Promise<void>;
}

const initialVendaState: IVenda = {
  id: undefined,
  cliente_fk: 0,
  produto_fk: 0,
  valor_pago: 0,
  valor_total: 0,
  quantidade: 1,
  desconto: 0,
  data_venda: new Date(),
  vendedor_fk: 0,
  forma_pagamento: "",
  produto: {
    id: 0,
    nome: "",
  },
  cliente: {
    id: 0,
    nome: "",
  },
  vendedor: {
    id: 0,
    login: "",
    email: "",
  },
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

const VendaFormulario: FC<VendaFormularioProps> = ({
  selecionado,
  abrirFormulario,
  fecharFormulario,
  salvar,
}) => {
  const [produtos, setProdutos] = useState<IProduto[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);

  // Função de conversão segura
  const parseDate = (date: any): Date => {
    try {
      return date instanceof Date ? date : new Date(date);
    } catch {
      return new Date();
    }
  };

  const [venda, setVenda] = useState<IVenda>({
    ...initialVendaState,
    data_venda: parseDate(initialVendaState.data_venda),
  });

  console.log("Venda:", venda);

  const dateFieldLabels: Record<string, string> = {
    data_venda: "Data da Venda",
  };

  const handleDateChange = (field: keyof IVenda) => (date: Date | null) => {
    setVenda((prev) => ({
      ...prev,
      [field]: date ? parseDate(date) : new Date(),
    }));
  };

  const handleApiError = (error: unknown) => {
    if (error instanceof AxiosError) {
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
      setVenda(selecionado);
    } else {
      setVenda(initialVendaState);
    }
  }, [selecionado]);

  const handleChange = (
    event:
      | SelectChangeEvent<unknown>
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setVenda((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await salvar(venda);
      fecharFormulario();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const fetchData = async () => {
    try {
      const responseProdutos = await api.get<IProduto[]>("/produtos");
      const responseUsuarios = await api.get<IUsuario[]>("/usuarios");
      const responseClientes = await api.get<ICliente[]>("/clientes");
      setProdutos(responseProdutos.data);
      setUsuarios(responseUsuarios.data);
      setClientes(responseClientes.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const valorPago = venda.valor_total * venda.quantidade - venda.desconto;
    setVenda((prev) => ({ ...prev, valor_pago: valorPago }));
  }, [venda.valor_total, venda.desconto, venda.quantidade]);

  return (
    <Dialog
      open={abrirFormulario}
      onClose={fecharFormulario}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {selecionado?.id ? "Editar Venda" : "Novo Venda"}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <GenericSelect
              options={clientes}
              valueKey="id"
              labelKey="nome"
              selectedValue={venda.cliente_fk}
              onChange={handleChange}
              label="Clientes"
              name="cliente_fk"
              required={true}
              gridSize={12}
            />
            <GenericSelect
              options={produtos}
              valueKey="id"
              labelKey="nome"
              selectedValue={venda.produto_fk}
              onChange={handleChange}
              label="Produtos"
              name="produto_fk"
              required={true}
              gridSize={12}
            />
            <Grid item xs={6}>
              <TextField
                label="Preço"
                name="valor_total"
                value={venda.valor_total}
                onChange={handleChange}
                onFocus={(e) => {
                  if (venda.valor_total === 0) {
                    handleChange({
                      target: {
                        name: "valor_total",
                        value: "",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                onBlur={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  const numericValue = rawValue
                    ? parseFloat(rawValue) / 100
                    : 0;

                  handleChange({
                    target: {
                      name: "valor_total",
                      value: numericValue,
                    },
                  } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                fullWidth
                InputProps={{
                  inputComponent: CurrencyInput as any,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Quantidade"
                name="quantidade"
                value={venda.quantidade}
                onChange={handleChange}
                onFocus={(e) => {
                  if (venda.quantidade === 1) {
                    handleChange({
                      target: {
                        name: "quantidade",
                        value: "",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                onBlur={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  const numericValue = rawValue === "" ? "1" : rawValue;

                  handleChange({
                    target: {
                      name: "quantidade",
                      value: numericValue,
                    },
                  } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Desconto"
                name="desconto"
                value={venda.desconto || 0}
                onChange={handleChange}
                onFocus={(e) => {
                  if (venda.desconto === 0) {
                    handleChange({
                      target: {
                        name: "desconto",
                        value: "",
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                onBlur={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  const numericValue = rawValue
                    ? parseFloat(rawValue) / 100
                    : 0;

                  handleChange({
                    target: {
                      name: "desconto",
                      value: numericValue,
                    },
                  } as unknown as React.ChangeEvent<HTMLInputElement>);
                }}
                fullWidth
                InputProps={{
                  inputComponent: CurrencyInput as any,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Valor Total"
                name="valor_pago"
                value={venda.valor_pago}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  readOnly: true,
                  inputComponent: CurrencyInput as any,
                }}
              />
            </Grid>
            <GenericSelect
              options={usuarios}
              valueKey="id"
              labelKey="login"
              selectedValue={venda.vendedor_fk}
              onChange={handleChange}
              label="Login do vendedor"
              name="vendedor_fk"
              required={true}
              gridSize={6}
            />
            <Grid item xs={6}>
              {["data_venda"].map((fieldName) => (
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ptBR}
                >
                  <DatePicker
                    key={fieldName}
                    label={dateFieldLabels[fieldName]}
                    value={parseDate(venda[fieldName as keyof IVenda])}
                    onChange={handleDateChange(fieldName as keyof IVenda)}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: fieldName === "data_venda",
                        name: fieldName,
                      },
                    }}
                  />
                </LocalizationProvider>
              ))}
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Forma de Pagamento</InputLabel>
                <Select
                  value={venda.forma_pagamento}
                  onChange={handleChange}
                  label="Forma de Pagamento"
                  inputProps={{ name: "forma_pagamento" }}
                >
                  {renderFormaPagamento()}
                </Select>
              </FormControl>
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

export default VendaFormulario;
