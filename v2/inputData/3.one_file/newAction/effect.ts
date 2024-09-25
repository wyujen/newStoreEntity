update$ = createEffect(
    () =>
        Actions.pipe(
            ofType(ActionMap.UpdateTarget),
            map((event: UpdateTarget) => this._webSocketService.update('UpdateTarget', event.payload))
        ),
    { dispatch: false }
);
