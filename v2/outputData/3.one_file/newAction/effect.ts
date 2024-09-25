update$ = createEffect(
    () =>
        Actions.pipe(
            ofType(ActionMap.UpdateBillOfMaterials),
            map((event: UpdateBillOfMaterials) => this._webSocketService.update('UpdateBillOfMaterials', event.payload))
        ),
    { dispatch: false }
);
update$ = createEffect(
    () =>
        Actions.pipe(
            ofType(ActionMap.UpdateInventoryReceipt),
            map((event: UpdateInventoryReceipt) => this._webSocketService.update('UpdateInventoryReceipt', event.payload))
        ),
    { dispatch: false }
);
