import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateMaterial, DeleteMaterial, UpdateMaterial } from '@yaotai/material/material.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class MaterialEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestMaterial),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.material)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateMaterial),
      map((event: CreateMaterial) => this._webSocketService.create(FeatureKeys.material, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadMaterial),
        map(() => this._webSocketService.read(FeatureKeys.material))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateMaterial),
        map((event: UpdateMaterial) => this._webSocketService.update(FeatureKeys.material, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteMaterial),
        map((event: DeleteMaterial) => this._webSocketService.delete(FeatureKeys.material, event.payload))
      ),
    { dispatch: false }
  );
}
