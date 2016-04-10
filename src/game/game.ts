import Log from '../../node_modules/gs-tools/src/log';


const LOG = new Log('pb.game.Game');

class Game {
  start(): void {
    LOG.info(`Game started`);
  }
}

export default Game;
