import Log from '../../node_modules/gs-tools/src/log';


const LOG = new Log('pb.game.Game');

/**
 * Instance of the game.
 *
 * Use this object to control the game state.
 */
class Game {
  start(): void {
    Log.info(LOG, `Game started`);
  }
}

export default Game;
