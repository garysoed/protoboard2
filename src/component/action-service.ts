import BaseDisposable from '../../node_modules/gs-tools/src/dispose/base-disposable';
import Bind from '../../node_modules/gs-tools/src/inject/a-bind';
import Cache from '../../node_modules/gs-tools/src/data/a-cache';
import {IActionHandler} from './iaction-handler';
import Inject from '../../node_modules/gs-tools/src/inject/a-inject';
import ListenableElement, { EventType as DomEventType }
    from '../../node_modules/gs-tools/src/event/listenable-element';
import Log from '../../node_modules/gs-tools/src/log';
import SortedSet from '../../node_modules/gs-tools/src/collection/sorted-set';

const LOG = new Log('pb.component.ActionService');


@Bind('pb.component.ActionService')
class ActionService extends BaseDisposable {
  private actionHandlers_: SortedSet<IActionHandler>;
  private root_: HTMLElement;

  constructor(@Inject('pb-root') root: HTMLElement) {
    super();
    this.actionHandlers_ = new SortedSet<IActionHandler>();
    this.root_ = root;
  }

  private onKeyPress_(event: KeyboardEvent): void {
    let handler = this.actionHandlers_.getAt(this.actionHandlers_.size - 1);
    if (!!handler) {
      try {
        handler.handleAction(event.key.toLowerCase());
      } catch (e) {
        Log.error(LOG, 'Key unhandled by polyfill');
      }
    }
  }

  addHandler(handler: IActionHandler): void {
    this.initialize();
    this.actionHandlers_.push(handler);
  }

  @Cache()
  initialize(): void {
    let listenableBody = ListenableElement.of<HTMLElement>(document.body);
    this.addDisposable(
        listenableBody,
        listenableBody.on(DomEventType.KEYPRESS, this.onKeyPress_.bind(this)));
  }

  removeHandler(handler: IActionHandler): void {
    this.actionHandlers_.remove(handler);
  }
}

export default ActionService;
