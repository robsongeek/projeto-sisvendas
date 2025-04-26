import { FormControl, InputLabel, Select, MenuItem, Grid, SelectChangeEvent } from '@mui/material';
import { ReactNode } from 'react';

interface GenericSelectProps<T extends Record<string, any>> {
  options: T[];
  valueKey: keyof T;
  labelKey: keyof T;
  selectedValue: unknown;
  onChange: (event: SelectChangeEvent<unknown>) => void;
  label: string;
  name: string;
  required?: boolean;
  gridSize?: number;
}

export const GenericSelect = <T extends Record<string, any>>({
  options,
  valueKey,
  labelKey,
  selectedValue,
  onChange,
  label,
  name,
  required = false,
  gridSize = 4 // Valor padrão
}: GenericSelectProps<T>) => {
  return (
    <Grid item xs={gridSize}>
      <FormControl fullWidth required={required}>
        <InputLabel>{label}</InputLabel>
        <Select
          value={selectedValue ?? ''}
          onChange={onChange}
          label={label}
          inputProps={{ name }}
        >
          {options.map((option) => (
            <MenuItem 
              key={String(option[valueKey])} 
              value={option[valueKey]}
            >
              {option[labelKey] as ReactNode}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>
  );
};