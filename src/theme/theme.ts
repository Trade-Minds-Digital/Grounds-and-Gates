import { createTheme } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { breakpoints } from './breakpoints';
import { components } from './components';

export const ggTheme = createTheme({
  palette,
  typography,
  breakpoints,
  components,
  shape: {
    borderRadius: 12,
  },
});

export default ggTheme;
