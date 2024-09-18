import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateSalesOrder, DeleteSalesOrder, UpdateSalesOrder } from '@yaotai/salesOrder/salesOrder.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class SalesOrderEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestSalesOrder),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.salesOrder)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateSalesOrder),
      map((event: CreateSalesOrder) => this._webSocketService.create(FeatureKeys.salesOrder, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadSalesOrder),
        map(() => this._webSocketService.read(FeatureKeys.salesOrder))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateSalesOrder),
        map((event: UpdateSalesOrder) => this._webSocketService.update(FeatureKeys.salesOrder, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteSalesOrder),
        map((event: DeleteSalesOrder) => this._webSocketService.delete(FeatureKeys.salesOrder, event.payload))
      ),
    { dispatch: false }
  );
}
