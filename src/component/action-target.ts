import ActionService from './action-service';
import {BaseElement} from '../../node_modules/gs-tools/src/webc/base-element';
import Component from './a-component';
import Inject from '../../node_modules/gs-tools/src/inject/a-inject';
import ListenableElement, { EventType as DomEventType }
    from '../../node_modules/gs-tools/src/event/listenable-element';


@Component({
  cssUrl: 'src/component/action-target.css',
  tag: 'pb-action-target',
  templateUrl: 'src/component/action-target',
})
class ActionTarget extends BaseElement {
  private actionService_: ActionService;
  private listenableElement_: ListenableElement<HTMLElement>;

  /**
   * @param actionService Injected instance.
   */
  constructor(@Inject('pb.component.ActionService') actionService: ActionService) {
    super();
    this.actionService_ = actionService;
  }

  private onMouseEnter_(): void {
    this.actionService_.addHandler(this);
  }

  private onMouseLeave_(): void {
    this.actionService_.removeHandler(this);
  }

  handleAction(key: string): void {
    // TODO: Implement
    console.log(`key ${key} pressed`);
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
