import { Injectable } from '@angular/core';
import { WebSocketService } from '../service/web-socket.service';
import { map } from 'rxjs';
import { createEffect, ofType, DefaultActionMap } from 'mycena-store';
import { ActionMap, CreateOriginal, DeleteOriginal, UpdateOriginal } from '@yaotai/original/original.actions';
import { Actions, FeatureKeys } from '@yaotai/frontend';
export interface ResMessage {
  status: string;
  info: any;
}

@Injectable()
export class OriginalEffects {
  constructor(private _webSocketService: WebSocketService) { }

  test$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.TestOriginal),
        map((event) => { })
      ),
    { dispatch: false }
  );

  init$ = createEffect(
    () =>
      Actions.pipe(
        ofType(DefaultActionMap.SystemInitiate),
        map(() => this._webSocketService.read(FeatureKeys.original)),
      ),
    { dispatch: false }
  );

  create$ = createEffect(
    () => Actions.pipe(
      ofType(ActionMap.CreateOriginal),
      map((event: CreateOriginal) => this._webSocketService.create(FeatureKeys.original, event.payload)),
    ),
    { dispatch: false }
  );

  read$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.ReadOriginal),
        map(() => this._webSocketService.read(FeatureKeys.original))
      ),
    { dispatch: false }
  );

  update$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.UpdateOriginal),
        map((event: UpdateOriginal) => this._webSocketService.update(FeatureKeys.original, event.payload))
      ),
    { dispatch: false }
  );

  delete$ = createEffect(
    () =>
      Actions.pipe(
        ofType(ActionMap.DeleteOriginal),
        map((event: DeleteOriginal) => this._webSocketService.delete(FeatureKeys.original, event.payload))
      ),
    { dispatch: false }
  );
}
