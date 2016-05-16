/**
 * Configuration object for a game.
 */
interface IGameConfig {
  /**
   * Component tag names to be registered for the game.
   */
  componentList: gs.ICtor<any>[];
}

export default IGameConfig;
