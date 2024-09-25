update$ = createEffect(
    () =>
        Actions.pipe(
            ofType(ActionMap.UpdateOriginal),
            map((event: UpdateOriginal) => this._webSocketService.update('UpdateOriginal', event.payload))
        ),
    { dispatch: false }
);
