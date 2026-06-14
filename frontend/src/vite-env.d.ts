/// <reference types="vite/client" />

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.less' {
  const content: any;
  export default content;
}

declare module 'tdesign-react/es/locale/zh_CN' {
  const content: any;
  export default content;
}
