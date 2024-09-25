import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OriginalRelation } from '@yaotai/relation';
import { DrawerComponentStore } from '../../../../component-store/drawer-component-store';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { Store } from '@yaotai/frontend';
import { DeleteOriginal, ReadOriginal } from '@yaotai/original/original.actions';
import { OriginalSignalService } from 'apps/frontend/src/app/service/signal/original.signal.service';

@Component({
  selector: 'yaotai-original-list',
  templateUrl: './original-list.component.html',
  styleUrls: ['./original-list.component.scss'],
})
export class OriginalListComponent implements OnInit {

  originalList: OriginalRelation[] = [];

  constructor(
    private _cdr: ChangeDetectorRef,
    private _drawerCS: DrawerComponentStore,
    private _popupCS: PopupComponentStore,
    protected originalSS: OriginalSignalService
  ) {
  }

  ngOnInit(): void {
    Store.dispatch(new ReadOriginal())
  }

  search() {
    console.log('Search');
  }
  update(original: any, event: Event) {
    event.stopPropagation()
    this._popupCS.openContentLevel1('yaotai-create-original')
    this._popupCS.setPayload(original)
  }

  deleted(originalId: string, event: Event) {
    event.stopPropagation()

    Store.dispatch(new DeleteOriginal([originalId]))
  }

  create() {
    this._popupCS.openContentLevel1('yaotai-create-original');
  }


}
