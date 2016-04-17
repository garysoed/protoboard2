import BaseComponent from './base-component';
import Component from './a-component';
import ListenableElement, { EventType as DomEventType }
    from '../../node_modules/gs-tools/src/event/listenable-element';


@Component({
  cssUrl: 'src/component/action-target.css',
  tag: 'pb-action-target',
  templateUrl: 'src/component/action-target',
})
class ActionTarget extends BaseComponent {
  private listenableElement_: ListenableElement<HTMLElement>;

  private onMouseEnter_(): void {
    // TODO
  }

  private onMouseLeave_(): void {
    // TODO
  }

  onCreated(element: HTMLElement): void {
    this.listenableElement_ = new ListenableElement<HTMLElement>(element);
    this.addDisposable(this.listenableElement_);

    this.listenableElement_.on(DomEventType.MOUSEENTER, this.onMouseEnter_.bind(this));
    this.listenableElement_.on(DomEventType.MOUSELEAVE, this.onMouseLeave_.bind(this));
  }
}

export default ActionTarget;
