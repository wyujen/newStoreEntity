import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TargetRelation } from '@yaotai/relation';
import { DrawerComponentStore } from '../../../../component-store/drawer-component-store';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { Store } from '@yaotai/frontend';
import { DeleteTarget, ReadTarget } from '@yaotai/target/target.actions';
import { TargetSignalService } from 'apps/frontend/src/app/service/signal/target.signal.service';

@Component({
  selector: 'yaotai-target-list',
  templateUrl: './target-list.component.html',
  styleUrls: ['./target-list.component.scss'],
})
export class TargetListComponent implements OnInit {

  targetList: TargetRelation[] = [];

  constructor(
    private _cdr: ChangeDetectorRef,
    private _drawerCS: DrawerComponentStore,
    private _popupCS: PopupComponentStore,
    protected targetSS: TargetSignalService
  ) {
  }

  ngOnInit(): void {
    Store.dispatch(new ReadTarget())
  }

  search() {
    console.log('Search');
  }
  update(target: any, event: Event) {
    event.stopPropagation()
    this._popupCS.openContentLevel1('yaotai-create-target')
    this._popupCS.setPayload(target)
  }

  deleted(targetId: string, event: Event) {
    event.stopPropagation()

    Store.dispatch(new DeleteTarget([targetId]))
  }

  create() {
    this._popupCS.openContentLevel1('yaotai-create-target');
  }


}
