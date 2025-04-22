import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@yaotai/frontend';
import { ProjectRelation } from '@yaotai/relation';
import { DrawerComponentStore } from '../../../../component-store/drawer-component-store';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { Subscription } from 'rxjs';

import { ReadTarget } from '@yaotai/target/target.actions';
import { TargetSignalService } from 'apps/frontend/src/app/service/signal/target.signal.service';

@Component({
  selector: 'yaotai-target-list',
  templateUrl: './target-list.component.html',
  styleUrls: ['./target-list.component.scss'],
})
export class TargetListComponent implements OnInit, OnDestroy {


  subscription: Subscription = new Subscription;


  constructor(
    public targetSS: TargetSignalService,
    private _cdr: ChangeDetectorRef,
    private _drawerCS: DrawerComponentStore,
    private _popupCS: PopupComponentStore
  ) { }

  ngOnInit(): void {
    Store.dispatch(new ReadTarget())
  }

  create() {
    this._popupCS.openContentLevel1('yaotai-create-target');
  }
  details(target: any) {
    this._drawerCS.setPayload(target);
    this._drawerCS.open('yaotai-drawer-target')
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
