import postcssJs, {type CssInJs} from 'postcss-js';

export const toStyleString = (css: CssInJs): string => postcssJs.parse(css).toString();
