import React, { ChangeEvent, useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";

interface MaskConfiguration {
  readonly replacements: ReadonlyArray<{ readonly regex: RegExp; readonly replace: string }>;
  readonly maxLength: number;
  readonly validationRegex?: RegExp | ((value: string) => boolean);
}

const maskConfigurations = {
  cep: {
    replacements: [
      { regex: /\D/g, replace: "" },
      { regex: /^(\d{5})(\d)/, replace: "$1-$2" },
    ],
    maxLength: 9,
    validationRegex: /^\d{5}-\d{3}$/,
  },
  cpf: {
    replacements: [
      { regex: /\D/g, replace: "" },
      { regex: /^(\d{3})(\d)/, replace: "$1.$2" },
      { regex: /^(\d{3})\.(\d{3})(\d)/, replace: "$1.$2.$3" },
      { regex: /^(\d{3})\.(\d{3})\.(\d{3})(\d)/, replace: "$1.$2.$3-$4" },
      { regex: /[-.]{1,}$/, replace: "" },
    ],
    maxLength: 14,
    validationRegex: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  },
  telefone: {
    replacements: [
      { regex: /\D/g, replace: "" },
      { regex: /^(\d{0,2})/, replace: "$1" },
      { regex: /^(\d{2})(\d)/, replace: "($1)$2" },
      { regex: /(\d{4})(\d)/, replace: "$1-$2" },
    ],
    maxLength: 13,
    validationRegex: /^\(\d{2}\)\d{4}-\d{4}$/,
  },
  celular: {
    replacements: [
      { regex: /\D/g, replace: "" },
      { regex: /^(\d{0,2})/, replace: "$1" },
      { regex: /^(\d{2})(\d)/, replace: "($1)$2" },
      { regex: /(\d{5})(\d)/, replace: "$1-$2" },
    ],
    maxLength: 14,
    validationRegex: /^\(\d{2}\)\d{5}-\d{4}$/,
  },
  cnpj: {
    replacements: [
      { regex: /\D/g, replace: "" },
      { regex: /^(\d{2})(\d)/, replace: "$1.$2" },
      { regex: /^(\d{2})\.(\d{3})(\d)/, replace: "$1.$2.$3" },
      { regex: /\.(\d{3})(\d)/, replace: ".$1/$2" },
      { regex: /(\d{4})(\d)/, replace: "$1-$2" },
      { regex: /(-\d{2})\d*$/, replace: "$1" },
    ],
    maxLength: 18,
    validationRegex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  },
  ie: {
    replacements: [
      { regex: /\D/g, replace: "" },
      { regex: /^(\d{3})(\d)/, replace: "$1.$2" },
      { regex: /^(\d{3})\.(\d{3})(\d)/, replace: "$1.$2.$3" },
      { regex: /^(\d{3}\.\d{3}\.\d{3})(\d)/, replace: "$1-$2" },
      { regex: /[-.]{1,}$/, replace: "" },
    ],
    maxLength: 13,
    validationRegex: /^\d{3}\.\d{3}\.\d{3}-\d$/,
  },
} as const;

type MaskedInputProps = Omit<TextFieldProps, "onChange"> & {
  maskConfig: MaskConfiguration;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    isValid: boolean
  ) => void;
};

const MaskedInput: React.FC<MaskedInputProps> = ({ maskConfig, value, onChange, ...props }) => {
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    maskConfig.replacements.forEach(({ regex, replace }) => {
      newValue = newValue.replace(regex, replace);
    });
    // Atualiza o estado antes de chamar onChange
    e.target.value = newValue;

    const isValid =
      typeof maskConfig.validationRegex === "function"
        ? maskConfig.validationRegex(newValue)
        : maskConfig.validationRegex
        ? maskConfig.validationRegex.test(newValue)
        : true;

    setError(!isValid && newValue.length > 0);
    setHelperText(!isValid && newValue.length > 0 ? "Formato inválido" : "");

    onChange(e, isValid);
  };

  return (
    <TextField
      {...props}
      value={value}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      inputProps={{ maxLength: maskConfig.maxLength, ...props.inputProps }}
    />
  );
};

type SpecializedInputProps = Omit<MaskedInputProps, "maskConfig"> & {
    value?: string;
  };

// Componentes especializados
export const CepInput: React.FC<Omit<SpecializedInputProps, "maskConfig">> = (props) => (
  <MaskedInput {...props} maskConfig={maskConfigurations.cep} />
);

export const CpfInput: React.FC<Omit<MaskedInputProps, "maskConfig">> = (props) => (
  <MaskedInput {...props} maskConfig={maskConfigurations.cpf} />
);

export const TelefoneInput: React.FC<Omit<MaskedInputProps, "maskConfig">> = (props) => (
  <MaskedInput {...props} maskConfig={maskConfigurations.telefone} />
);

export const CelularInput: React.FC<Omit<MaskedInputProps, "maskConfig">> = (props) => (
  <MaskedInput {...props} maskConfig={maskConfigurations.celular} />
);

export const CnpjInput: React.FC<Omit<MaskedInputProps, "maskConfig">> = (props) => (
  <MaskedInput {...props} maskConfig={maskConfigurations.cnpj} />
);

export const StateRegistrationInput: React.FC<Omit<MaskedInputProps, "maskConfig">> = (props) => (
  <MaskedInput {...props} maskConfig={maskConfigurations.ie} />
);

export const EmailInput: React.FC<Omit<MaskedInputProps, "maskConfig">> = (props) => {
  const [error, setError] = useState(false);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}?$/;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isValid = emailRegex.test(e.target.value);
    setError(!isValid && e.target.value.length > 0);
    props.onChange(e, isValid);
  };

  return (
    <TextField
      {...props}
      onChange={handleChange}
      error={error}
      helperText={error ? "E-mail inválido" : ""}
      inputProps={{ type: "email", ...props.inputProps }}
    />
  );
};