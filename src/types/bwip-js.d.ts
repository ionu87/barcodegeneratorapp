declare module 'bwip-js' {
  interface ToCanvasOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    includetext?: boolean;
    textsize?: number;
    textxalign?: 'center' | 'left' | 'right';
    textyalign?: 'top' | 'bottom';
    backgroundcolor?: string;
    barcolor?: string;
    padding?: number;
    paddingwidth?: number;
    paddingheight?: number;
    rotate?: 'N' | 'R' | 'L' | 'I';
  }

  function toCanvas(canvas: HTMLCanvasElement, options: ToCanvasOptions): void;
  function toBuffer(options: ToCanvasOptions): Promise<Buffer>;
  
  export { toCanvas, toBuffer };
  export default { toCanvas, toBuffer };
}
