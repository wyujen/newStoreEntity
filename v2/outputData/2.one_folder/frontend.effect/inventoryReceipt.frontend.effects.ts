import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateInventoryReceipt, DeleteInventoryReceipt, UpdateInventoryReceipt } from '@yaotai/inventoryReceipt/inventoryReceipt.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class InventoryReceiptEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestInventoryReceipt),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.inventoryReceipt)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateInventoryReceipt),
      map((event: CreateInventoryReceipt) => this._webSocketService.create(FeatureKeys.inventoryReceipt, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadInventoryReceipt),
        map(() => this._webSocketService.read(FeatureKeys.inventoryReceipt))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateInventoryReceipt),
        map((event: UpdateInventoryReceipt) => this._webSocketService.update(FeatureKeys.inventoryReceipt, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteInventoryReceipt),
        map((event: DeleteInventoryReceipt) => this._webSocketService.delete(FeatureKeys.inventoryReceipt, event.payload))
      ),
    { dispatch: false }
  );
}
