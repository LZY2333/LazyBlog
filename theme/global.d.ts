// global.d.ts
declare module '*.module.css' {
    const classes: Record<string, string>;
    export default classes;
}
// global.d.ts
declare module '*.module.less' {
    const classes: Record<string, string>;
    export default classes;
}