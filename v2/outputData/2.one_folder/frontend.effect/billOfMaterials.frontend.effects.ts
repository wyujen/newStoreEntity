import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateBillOfMaterials, DeleteBillOfMaterials, UpdateBillOfMaterials } from '@yaotai/billOfMaterials/billOfMaterials.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class BillOfMaterialsEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestBillOfMaterials),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.billOfMaterials)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateBillOfMaterials),
      map((event: CreateBillOfMaterials) => this._webSocketService.create(FeatureKeys.billOfMaterials, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadBillOfMaterials),
        map(() => this._webSocketService.read(FeatureKeys.billOfMaterials))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateBillOfMaterials),
        map((event: UpdateBillOfMaterials) => this._webSocketService.update(FeatureKeys.billOfMaterials, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteBillOfMaterials),
        map((event: DeleteBillOfMaterials) => this._webSocketService.delete(FeatureKeys.billOfMaterials, event.payload))
      ),
    { dispatch: false }
  );
}
