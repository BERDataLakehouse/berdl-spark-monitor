import { Panel } from '@lumino/widgets';
import { Message } from '@lumino/messaging';

/**
 * Lumino Panel subclass that tracks visibility and bridges it to React.
 *
 * Encapsulates the visibility ref pattern: Lumino writes `visibilityRef`
 * synchronously on show/hide, while `setVisible` is the React state setter
 * wired up after mount. Consumers call `getVisibility()` to read the
 * current value without depending on React render timing.
 */
export class SparkMonitorLuminoPanel extends Panel {
  private _visible = false;
  private _setVisible: ((v: boolean) => void) | null = null;

  /** Current visibility state (sync read for React initial state). */
  getVisibility(): boolean {
    return this._visible;
  }

  /** Wire up the React setState callback after the React tree mounts. */
  setVisibilityCallback(cb: (visible: boolean) => void): void {
    this._setVisible = cb;
    // Sync in case onAfterShow fired before React mounted
    cb(this._visible);
  }

  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this._visible = true;
    this._setVisible?.(true);
  }

  protected onAfterHide(msg: Message): void {
    super.onAfterHide(msg);
    this._visible = false;
    this._setVisible?.(false);
  }
}
