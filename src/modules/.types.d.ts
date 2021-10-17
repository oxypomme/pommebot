export interface IModule {
  start: () => boolean | Promise<boolean>;
  stop: () => boolean | Promise<boolean>;
}
