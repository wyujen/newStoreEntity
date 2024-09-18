import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateProduct, DeleteProduct, UpdateProduct } from '@yaotai/product/product.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class ProductEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestProduct),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.product)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateProduct),
      map((event: CreateProduct) => this._webSocketService.create(FeatureKeys.product, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadProduct),
        map(() => this._webSocketService.read(FeatureKeys.product))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateProduct),
        map((event: UpdateProduct) => this._webSocketService.update(FeatureKeys.product, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteProduct),
        map((event: DeleteProduct) => this._webSocketService.delete(FeatureKeys.product, event.payload))
      ),
    { dispatch: false }
  );
}
