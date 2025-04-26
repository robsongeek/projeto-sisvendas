export interface IUsuario {
  id?: number;
  login: string;
  email: string;
  senha: string;
  confirmacao_senha: string;
  nivel_acesso: string;
}
