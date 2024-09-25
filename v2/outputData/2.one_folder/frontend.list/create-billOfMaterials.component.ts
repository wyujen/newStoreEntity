import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { RouterComponentStore } from '../../../../component-store/router-component-store';
import { addToSubscription } from '../../../../share/share.function';
import { CreateBillOfMaterials, UpdateBillOfMaterials } from '@yaotai/billOfMaterials/billOfMaterials.actions';
import { Store } from '@yaotai/frontend';
import { BillOfMaterials } from '@yaotai/billOfMaterials/billOfMaterials.model';

type StreamName = 'lastPathUrl';

@Component({
  selector: 'yaotai-create-billOfMaterials',
  templateUrl: './create-billOfMaterials.component.html',
  styleUrls: ['./create-billOfMaterials.component.scss'],
})
export class CreateBillOfMaterialsComponent {

  stream: Record<StreamName, Observable<any> | undefined> = {
    lastPathUrl: undefined,
  }
  billOfMaterialsType!: string;
  billOfMaterialsForm: FormGroup;
  subscription: Subscription = new Subscription;
  inputBillOfMaterials: BillOfMaterials | undefined


  constructor(private _cdr: ChangeDetectorRef, private _popupCS: PopupComponentStore, private _fb: FormBuilder, private _routerCS: RouterComponentStore) {
    this.billOfMaterialsForm = this._fb.group({
      type: [''],
      name: [''],
    });
  }
  ngOnInit(): void {
    this._popupCS.selectPayload$.subscribe((payload) => {
      this.inputBillOfMaterials = payload,
        this.billOfMaterialsForm.patchValue(payload)
      this._cdr.detectChanges()
    });
  }

  save() {
    const billOfMaterialsData = {
      groupId: 'group-ba9795d5-6304-43bd-8abc-5460b93e58da',
      type: this.billOfMaterialsForm.get('type')?.value,
      name: this.billOfMaterialsForm.get('name')?.value,
    }
    if (!this.inputBillOfMaterials) {
      console.log('create-->', billOfMaterialsData)
      Store.dispatch(new CreateBillOfMaterials([billOfMaterialsData]));

    } else {
      const updateData = {
        ...billOfMaterialsData,
        id: this.inputBillOfMaterials.id,
      }
      Store.dispatch(new UpdateBillOfMaterials([updateData]));
      console.log('update-->', billOfMaterialsData)

    }
    this._popupCS.closeContentLevel1();
  }

  close() {
    this._popupCS.closeContentLevel1();
  }

}
