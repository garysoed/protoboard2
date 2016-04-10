import Log from '../../node_modules/gs-tools/src/log';

const LOG = new Log('pb.component.ComponentConfig');



class ComponentConfig {
  private name_: string;

  constructor(name: string) {
    this.name_ = name;
  }

  register(): void {
    LOG.info(`Registered ${this.name_}`);
  }
}

export default ComponentConfig;
