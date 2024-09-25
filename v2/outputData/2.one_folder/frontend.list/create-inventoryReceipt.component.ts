import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { RouterComponentStore } from '../../../../component-store/router-component-store';
import { addToSubscription } from '../../../../share/share.function';
import { CreateInventoryReceipt, UpdateInventoryReceipt } from '@yaotai/inventoryReceipt/inventoryReceipt.actions';
import { Store } from '@yaotai/frontend';
import { InventoryReceipt } from '@yaotai/inventoryReceipt/inventoryReceipt.model';

type StreamName = 'lastPathUrl';

@Component({
  selector: 'yaotai-create-inventoryReceipt',
  templateUrl: './create-inventoryReceipt.component.html',
  styleUrls: ['./create-inventoryReceipt.component.scss'],
})
export class CreateInventoryReceiptComponent {

  stream: Record<StreamName, Observable<any> | undefined> = {
    lastPathUrl: undefined,
  }
  inventoryReceiptType!: string;
  inventoryReceiptForm: FormGroup;
  subscription: Subscription = new Subscription;
  inputInventoryReceipt: InventoryReceipt | undefined


  constructor(private _cdr: ChangeDetectorRef, private _popupCS: PopupComponentStore, private _fb: FormBuilder, private _routerCS: RouterComponentStore) {
    this.inventoryReceiptForm = this._fb.group({
      type: [''],
      name: [''],
    });
  }
  ngOnInit(): void {
    this._popupCS.selectPayload$.subscribe((payload) => {
      this.inputInventoryReceipt = payload,
        this.inventoryReceiptForm.patchValue(payload)
      this._cdr.detectChanges()
    });
  }

  save() {
    const inventoryReceiptData = {
      groupId: 'group-ba9795d5-6304-43bd-8abc-5460b93e58da',
      type: this.inventoryReceiptForm.get('type')?.value,
      name: this.inventoryReceiptForm.get('name')?.value,
    }
    if (!this.inputInventoryReceipt) {
      console.log('create-->', inventoryReceiptData)
      Store.dispatch(new CreateInventoryReceipt([inventoryReceiptData]));

    } else {
      const updateData = {
        ...inventoryReceiptData,
        id: this.inputInventoryReceipt.id,
      }
      Store.dispatch(new UpdateInventoryReceipt([updateData]));
      console.log('update-->', inventoryReceiptData)

    }
    this._popupCS.closeContentLevel1();
  }

  close() {
    this._popupCS.closeContentLevel1();
  }

}
