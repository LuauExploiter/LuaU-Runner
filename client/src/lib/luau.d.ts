declare interface LuauModule {
  run: (code: string) => string;
}

declare function Luau(options?: any): Promise<LuauModule>;

export default Luau;
