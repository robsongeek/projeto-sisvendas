export interface IFornecedor {
  id?: number;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  celular?: string;
  cnpj: string;
  email: string;
  status: string;
}