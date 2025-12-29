/**
 * Box component with Restyle
 * Layout primitive with theme-aware props
 */

import { createBox } from '@shopify/restyle';
import type { Theme } from '@/theme/theme';

const Box = createBox<Theme>();

export default Box;
