import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { PopupComponentStore } from '../../../../component-store/popup-component-store';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { RouterComponentStore } from '../../../../component-store/router-component-store';
import { addToSubscription } from '../../../../share/share.function';
import { CreateTarget, UpdateTarget } from '@yaotai/target/target.actions';
import { Store } from '@yaotai/frontend';
import { Target } from '@yaotai/target/target.model';
import { GroupSignalService } from 'apps/frontend/src/app/service/signal/group.signal.service';


type StreamName = 'lastPathUrl';

@Component({
  selector: 'yaotai-create-target',
  templateUrl: './create-target.component.html',
  styleUrls: ['./create-target.component.scss'],
})
export class CreateTargetComponent implements OnInit, OnDestroy {

  stream: Record<StreamName, Observable<any> | undefined> = {
    lastPathUrl: undefined,
  }
  targetType!: string;
  targetForm: FormGroup;
  subscription: Subscription = new Subscription;
  originalTarget: Target | undefined


  constructor(
    private _cdr: ChangeDetectorRef,
    private _popupCS: PopupComponentStore,
    private _fb: FormBuilder,
    private _routerCS: RouterComponentStore,
    public groupSS: GroupSignalService,
  ) {
    this.targetForm = this._fb.group({
      type: [''],
      name: [''],
      groupId: [''],
    });
  }
  ngOnInit(): void {
    const payloadSuber = this._popupCS.selectPayload$.subscribe((payload) => {
      this.originalTarget = payload,
        this.targetForm.patchValue(payload)
      this._cdr.detectChanges()
    });
    addToSubscription(this.subscription, payloadSuber);

  }

  save() {
    const formdata = {
      type: this.targetForm.get('type')?.value,
      name: this.targetForm.get('name')?.value,
    }
    if (!this.originalTarget) {
      const createForm = {
        ...formdata,
        groupId: this.groupSS.yaoTaiSignal().id,
      }
      console.log('create-->', createForm)
      Store.dispatch(new CreateTarget([createForm]));

    } else {
      const updateData = {
        ...formdata,
        id: this.originalTarget.id,
      }
      Store.dispatch(new UpdateTarget([updateData]));
      console.log('update-->', updateData)

    }
    this._popupCS.closeContentLevel1();
  }

  close() {
    this._popupCS.closeContentLevel1();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
