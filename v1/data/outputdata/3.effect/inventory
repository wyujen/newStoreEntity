import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateInventory, DeleteInventory, UpdateInventory } from '@yaotai/inventory/inventory.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class InventoryEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestInventory),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.inventory)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateInventory),
      map((event: CreateInventory) => this._webSocketService.create(FeatureKeys.inventory, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadInventory),
        map(() => this._webSocketService.read(FeatureKeys.inventory))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateInventory),
        map((event: UpdateInventory) => this._webSocketService.update(FeatureKeys.inventory, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteInventory),
        map((event: DeleteInventory) => this._webSocketService.delete(FeatureKeys.inventory, event.payload))
      ),
    { dispatch: false }
  );
}
