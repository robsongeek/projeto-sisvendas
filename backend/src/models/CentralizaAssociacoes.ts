import Fornecedor from './FornecedoresModel';
import Produto from './ProdutosModel';
import Cliente from './ClientesModel';
import Vendas from './VendasModel';
import Usuario from './UsuariosModal';

// Configure as associações
// hasMany => Define uma relação um-para-muitos (1:N)
Fornecedor.hasMany(Produto, {
  foreignKey: 'fornecedor_fk',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  as: 'produtos'
});

Cliente.hasMany(Vendas, {
  foreignKey: "cliente_fk", 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  as: "vendas", 
});


Produto.hasMany(Vendas, {
  foreignKey: "produto_fk", 
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  as: "vendas", 
});


Usuario.hasMany(Vendas, {
  foreignKey: "vendedor_fk",
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE', 
  as: "vendas", 
});

// belongsTo => Define a relação muitos-para-um (N:1)
Produto.belongsTo(Fornecedor, {
  foreignKey: 'fornecedor_fk',
  as: 'fornecedor'
});

Vendas.belongsTo(Cliente, {
  foreignKey: "cliente_fk", 
  as: "cliente", 
});


Vendas.belongsTo(Produto, {
  foreignKey: "produto_fk", 
  as: "produto", 
});


Vendas.belongsTo(Usuario, {
  foreignKey: "vendedor_fk", 
  as: "vendedor", 
});


export {
  Fornecedor,
  Produto,
  Cliente,
  Vendas,
  Usuario,
};