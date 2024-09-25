import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { RouterComponentStore } from '../../../../component-store/router-component-store';
import { addToSubscription } from '../../../../share/share.function';
import { CreateOriginal, UpdateOriginal } from '@yaotai/original/original.actions';
import { Store } from '@yaotai/frontend';
import { Original } from '@yaotai/original/original.model';

type StreamName = 'lastPathUrl';

@Component({
  selector: 'yaotai-create-original',
  templateUrl: './create-original.component.html',
  styleUrls: ['./create-original.component.scss'],
})
export class CreateOriginalComponent {

  stream: Record<StreamName, Observable<any> | undefined> = {
    lastPathUrl: undefined,
  }
  originalType!: string;
  originalForm: FormGroup;
  subscription: Subscription = new Subscription;
  inputOriginal: Original | undefined


  constructor(private _cdr: ChangeDetectorRef, private _popupCS: PopupComponentStore, private _fb: FormBuilder, private _routerCS: RouterComponentStore) {
    this.originalForm = this._fb.group({
      type: [''],
      name: [''],
    });
  }
  ngOnInit(): void {
    this._popupCS.selectPayload$.subscribe((payload) => {
      this.inputOriginal = payload,
        this.originalForm.patchValue(payload)
      this._cdr.detectChanges()
    });
  }

  save() {
    const originalData = {
      groupId: 'group-ba9795d5-6304-43bd-8abc-5460b93e58da',
      type: this.originalForm.get('type')?.value,
      name: this.originalForm.get('name')?.value,
    }
    if (!this.inputOriginal) {
      console.log('create-->', originalData)
      Store.dispatch(new CreateOriginal([originalData]));

    } else {
      const updateData = {
        ...originalData,
        id: this.inputOriginal.id,
      }
      Store.dispatch(new UpdateOriginal([updateData]));
      console.log('update-->', originalData)

    }
    this._popupCS.closeContentLevel1();
  }

  close() {
    this._popupCS.closeContentLevel1();
  }

}
