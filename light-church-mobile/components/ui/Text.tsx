/**
 * Text component with Restyle
 * Typography primitive with theme-aware props
 */

import { createText } from '@shopify/restyle';
import type { Theme } from '@/theme/theme';

const Text = createText<Theme>();

export default Text;
