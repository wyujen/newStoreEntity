import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BillOfMaterialsRelation } from '@yaotai/relation';
import { DrawerComponentStore } from '../../../../component-store/drawer-component-store';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { Store } from '@yaotai/frontend';
import { DeleteBillOfMaterials, ReadBillOfMaterials } from '@yaotai/billOfMaterials/billOfMaterials.actions';
import { BillOfMaterialsSignalService } from 'apps/frontend/src/app/service/signal/billOfMaterials.signal.service';

@Component({
  selector: 'yaotai-billOfMaterials-list',
  templateUrl: './billOfMaterials-list.component.html',
  styleUrls: ['./billOfMaterials-list.component.scss'],
})
export class BillOfMaterialsListComponent implements OnInit {

  billOfMaterialsList: BillOfMaterialsRelation[] = [];

  constructor(
    private _cdr: ChangeDetectorRef,
    private _drawerCS: DrawerComponentStore,
    private _popupCS: PopupComponentStore,
    protected billOfMaterialsSS: BillOfMaterialsSignalService
  ) {
  }

  ngOnInit(): void {
    Store.dispatch(new ReadBillOfMaterials())
  }

  search() {
    console.log('Search');
  }
  update(billOfMaterials: any, event: Event) {
    event.stopPropagation()
    this._popupCS.openContentLevel1('yaotai-create-billOfMaterials')
    this._popupCS.setPayload(billOfMaterials)
  }

  deleted(billOfMaterialsId: string, event: Event) {
    event.stopPropagation()

    Store.dispatch(new DeleteBillOfMaterials([billOfMaterialsId]))
  }

  create() {
    this._popupCS.openContentLevel1('yaotai-create-billOfMaterials');
  }


}
