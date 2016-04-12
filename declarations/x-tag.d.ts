declare module xtag {
  interface IConfig {
    content?: string,
    lifecycle?: ILifecycleConfig
  }

  interface ILifecycleConfig {
    created?: () => void;
    inserted?: () => void;
    removed?: () => void;
    attributeChanged?: (attrName: string, oldValue: string, newValue: string) => void;
  }

  interface IInstance {
    register(name: string, config: IConfig): void
  }
}
