import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { InventoryReceiptRelation } from '@yaotai/relation';
import { DrawerComponentStore } from '../../../../component-store/drawer-component-store';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { Store } from '@yaotai/frontend';
import { DeleteInventoryReceipt, ReadInventoryReceipt } from '@yaotai/inventoryReceipt/inventoryReceipt.actions';
import { InventoryReceiptSignalService } from 'apps/frontend/src/app/service/signal/inventoryReceipt.signal.service';

@Component({
  selector: 'yaotai-inventoryReceipt-list',
  templateUrl: './inventoryReceipt-list.component.html',
  styleUrls: ['./inventoryReceipt-list.component.scss'],
})
export class InventoryReceiptListComponent implements OnInit {

  inventoryReceiptList: InventoryReceiptRelation[] = [];

  constructor(
    private _cdr: ChangeDetectorRef,
    private _drawerCS: DrawerComponentStore,
    private _popupCS: PopupComponentStore,
    protected inventoryReceiptSS: InventoryReceiptSignalService
  ) {
  }

  ngOnInit(): void {
    Store.dispatch(new ReadInventoryReceipt())
  }

  search() {
    console.log('Search');
  }
  update(inventoryReceipt: any, event: Event) {
    event.stopPropagation()
    this._popupCS.openContentLevel1('yaotai-create-inventoryReceipt')
    this._popupCS.setPayload(inventoryReceipt)
  }

  deleted(inventoryReceiptId: string, event: Event) {
    event.stopPropagation()

    Store.dispatch(new DeleteInventoryReceipt([inventoryReceiptId]))
  }

  create() {
    this._popupCS.openContentLevel1('yaotai-create-inventoryReceipt');
  }


}
