export interface ICliente {
    id?: number; 
    nome: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone?: string; 
    celular?: string; 
    email: string;
    cpf?: string; 
    sexo: string;
  }