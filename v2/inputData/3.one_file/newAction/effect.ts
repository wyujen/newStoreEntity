
readDetail$ = createEffect(
    () =>
        Actions.pipe(
            ofType(ActionMap.ReadTargetDatail),
            map((event: ReadTargetDetail) => this._webSocketService.update('targetDetail', event.payload))
        ),
    { dispatch: false }
);

