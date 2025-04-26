export interface IProduto {
    id?: number;
    nome: string;
    preco: number;
    estoque: number;
    fornecedor_fk: number;
    fornecedor?: {  
        id: number;
        nome: string;
      };
}