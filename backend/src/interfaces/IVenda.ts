export interface IVenda {
  id?: number;
  data_venda: Date;
  valor_total: number;
  desconto: number;
  cliente_fk: number;
  produto_fk: number;
  vendedor_fk: number;
  valor_pago: number;
  quantidade: number;
  forma_pagamento: string;
}