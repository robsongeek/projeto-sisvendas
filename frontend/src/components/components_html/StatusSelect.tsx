import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  FormHelperText,
  Grid,
} from "@mui/material";

interface GenderSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: string;
  name?: string;
}

const StatusSelect = ({
  value,
  onChange,
  error,
  helperText,
  name = "sexo",
}: GenderSelectProps) => {
  const options = [
    { value: "A", label: "Ativo" },
    { value: "I", label: "Inativo" },
  ];

  return (
    <Grid item xs={12}>
      <FormControl component="fieldset" fullWidth error={error}>
        <FormLabel
          component="legend"
          sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}
        >
          Status
        </FormLabel>

        <RadioGroup
          aria-labelledby="sex-radio-buttons-group"
          name={name}
          value={value}
          onChange={onChange}
          row
          sx={{ gap: 3 }}
        >
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  size="small"
                  sx={{
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                    color: "text.secondary",
                    "&.Mui-checked": { color: "primary.main" },
                  }}
                />
              }
              label={
                <Typography variant="body2" component="span">
                  {option.label}
                </Typography>
              }
              sx={{ marginRight: 0 }}
            />
          ))}
        </RadioGroup>

        {error && (
          <FormHelperText
            error
            sx={{
              mt: 0.5,
              visibility: error ? "visible" : "hidden", 
              height: error ? "auto" : "20px", 
            }}
          >
            {helperText || " "} 
          </FormHelperText>
        )}
      </FormControl>
    </Grid>
  );
};

export default StatusSelect;
