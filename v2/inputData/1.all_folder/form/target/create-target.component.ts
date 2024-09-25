import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { RouterComponentStore } from '../../../../component-store/router-component-store';
import { addToSubscription } from '../../../../share/share.function';
import { CreateTarget, UpdateTarget } from '@yaotai/target/target.actions';
import { Store } from '@yaotai/frontend';
import { Target } from '@yaotai/target/target.model';

type StreamName = 'lastPathUrl';

@Component({
  selector: 'yaotai-create-target',
  templateUrl: './create-target.component.html',
  styleUrls: ['./create-target.component.scss'],
})
export class CreateTargetComponent {

  stream: Record<StreamName, Observable<any> | undefined> = {
    lastPathUrl: undefined,
  }
  targetType!: string;
  targetForm: FormGroup;
  subscription: Subscription = new Subscription;
  originalTarget: Target | undefined


  constructor(private _cdr: ChangeDetectorRef, private _popupCS: PopupComponentStore, private _fb: FormBuilder, private _routerCS: RouterComponentStore) {
    this.targetForm = this._fb.group({
      type: [''],
      name: [''],
    });
  }
  ngOnInit(): void {
    this._popupCS.selectPayload$.subscribe((payload) => {
      this.originalTarget = payload,
        this.targetForm.patchValue(payload)
      this._cdr.detectChanges()
    });
  }

  save() {
    const targetData = {
      groupId: 'group-ba9795d5-6304-43bd-8abc-5460b93e58da',
      type: this.targetForm.get('type')?.value,
      name: this.targetForm.get('name')?.value,
    }
    if (!this.originalTarget) {
      console.log('create-->', targetData)
      Store.dispatch(new CreateTarget([targetData]));

    } else {
      const updateData = {
        ...targetData,
        id: this.originalTarget.id,
      }
      Store.dispatch(new UpdateTarget([updateData]));
      console.log('update-->', targetData)

    }
    this._popupCS.closeContentLevel1();
  }

  close() {
    this._popupCS.closeContentLevel1();
  }

}
