import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreatePurchuserOrder, DeletePurchuserOrder, UpdatePurchuserOrder } from '@yaotai/purchuserOrder/purchuserOrder.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class PurchuserOrderEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestPurchuserOrder),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.purchuserOrder)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreatePurchuserOrder),
      map((event: CreatePurchuserOrder) => this._webSocketService.create(FeatureKeys.purchuserOrder, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadPurchuserOrder),
        map(() => this._webSocketService.read(FeatureKeys.purchuserOrder))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdatePurchuserOrder),
        map((event: UpdatePurchuserOrder) => this._webSocketService.update(FeatureKeys.purchuserOrder, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeletePurchuserOrder),
        map((event: DeletePurchuserOrder) => this._webSocketService.delete(FeatureKeys.purchuserOrder, event.payload))
      ),
    { dispatch: false }
  );
}
