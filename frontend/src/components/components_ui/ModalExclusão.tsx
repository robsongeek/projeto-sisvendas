import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Typography,
    Box,
    useTheme,
  } from "@mui/material";
  import { Delete as DeleteIcon } from "@mui/icons-material";
  import WarningIcon from '@mui/icons-material/Warning';
  
  interface ModalExclusaoProps {
    abrirModal: boolean;
    fecharModal: () => void;
    confirmarExclusao: () => void;
    nomeItemASerExcluido: string;
    mensagemComplementar?: string;
  }
  
  export const ModalExclusao = ({
    abrirModal,
    fecharModal,
    confirmarExclusao,
    nomeItemASerExcluido,
    mensagemComplementar,
  }: ModalExclusaoProps) => {
    const theme = useTheme();
  
    return (
      <Dialog
        open={abrirModal}
        onClose={fecharModal}
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ bgcolor: theme.palette.background.paper }}>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="error" />
            Confirmar Exclusão
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <Typography>
            Tem certeza que deseja excluir {mensagemComplementar} <strong>{nomeItemASerExcluido || "Item não especificado"}</strong>?
          </Typography>
          {mensagemComplementar && (
            <Typography sx={{ mt: 1 }}><strong>Esta ação não poderá ser desfeita.</strong></Typography>
          )}
        </DialogContent>
  
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={fecharModal}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarExclusao}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
            startIcon={<DeleteIcon />}
          >
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>
    );
  };