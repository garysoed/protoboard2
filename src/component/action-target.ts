import ActionService from './action-service';
import Asserts from '../../node_modules/gs-tools/src/assert/asserts';
import {BaseElement} from '../../node_modules/gs-tools/src/webc/base-element';
import Doms from '../../node_modules/gs-tools/src/ui/doms';
import {Element} from '../util/a-element';
import {IAction} from '../action/iaction';
import Inject from '../../node_modules/gs-tools/src/inject/a-inject';
import {Iterables} from '../../node_modules/gs-tools/src/collection/iterables';
import ListenableElement, { EventType as DomEventType }
    from '../../node_modules/gs-tools/src/event/listenable-element';


@Element({
  cssUrl: 'src/component/action-target.css',
  tag: 'pb-action-target',
  templateUrl: 'src/component/action-target',
})
class ActionTarget extends BaseElement {
  private actionMap_: Map<string, IAction>;
  private actionService_: ActionService;
  private listenableElement_: ListenableElement<HTMLElement>;
  private targetComponent_: HTMLElement;

  /**
   * @param actionService Injected instance.
   */
  constructor(@Inject('pb.component.ActionService') actionService: ActionService) {
    super();
    this.actionMap_ = new Map<string, IAction>();
    this.actionService_ = actionService;
  }

  private onMouseEnter_(): void {
    this.actionService_.addHandler(this);
  }

  private onMouseLeave_(): void {
    this.actionService_.removeHandler(this);
  }

  addAction(action: IAction): void {
    Asserts.map(this.actionMap_).toNot.containKey(action.key)
        .orThrows(`${action.key} is already registered`);
    this.actionMap_.set(action.key, action);
  }

  handleAction(key: string): void {
    if (this.actionMap_.has(key)) {
      this.actionMap_.get(key).trigger();
    }
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.listenableElement_ = ListenableElement.of<HTMLElement>(element);
    this.addDisposable(
        this.listenableElement_,
        this.listenableElement_.on(DomEventType.MOUSEENTER, this.onMouseEnter_.bind(this)),
        this.listenableElement_.on(DomEventType.MOUSELEAVE, this.onMouseLeave_.bind(this)));
  }
}

export default ActionTarget;
