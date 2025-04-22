import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DrawerComponentStore } from '../../../../component-store/drawer-component-store';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { addToSubscription } from '../../../../share/share.function';
import { Subscription } from 'rxjs';
import { Store } from '@yaotai/frontend';
import { DeleteTarget } from '@yaotai/target/target.actions';

@Component({
  selector: 'yaotai-drawer-target',
  templateUrl: './drawer-target.component.html',
  styleUrls: ['./drawer-target.component.scss'],
})
export class DrawerTargetComponent implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription;

  target: any = null;

  constructor(
    private _cdr: ChangeDetectorRef,
    private _drawerCS: DrawerComponentStore,
    private _popupCS: PopupComponentStore
  ) { }

  ngOnInit(): void {
    const payloadSuber = this._drawerCS.selectedPaylodad$.subscribe((payload) => {
      this.target = payload;
    })
    addToSubscription(this.subscription, payloadSuber);
  }

  updateTarget() {
    this._popupCS.setPayload(this.target);
    this._popupCS.openContentLevel1('yaotai-create-target');
  }
  deleteTarget() {
    Store.dispatch(new DeleteTarget([this.target.id]));
  }

  close() {
    this._drawerCS.close();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

