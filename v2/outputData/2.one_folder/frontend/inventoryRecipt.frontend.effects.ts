import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateInventoryRecipt, DeleteInventoryRecipt, UpdateInventoryRecipt } from '@yaotai/inventoryRecipt/inventoryRecipt.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class InventoryReciptEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestInventoryRecipt),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.inventoryRecipt)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateInventoryRecipt),
      map((event: CreateInventoryRecipt) => this._webSocketService.create(FeatureKeys.inventoryRecipt, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadInventoryRecipt),
        map(() => this._webSocketService.read(FeatureKeys.inventoryRecipt))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateInventoryRecipt),
        map((event: UpdateInventoryRecipt) => this._webSocketService.update(FeatureKeys.inventoryRecipt, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteInventoryRecipt),
        map((event: DeleteInventoryRecipt) => this._webSocketService.delete(FeatureKeys.inventoryRecipt, event.payload))
      ),
    { dispatch: false }
  );
}
