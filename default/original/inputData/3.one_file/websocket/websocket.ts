strategy.set(CommonFeatureKeys.original, (dataList: any[]) => {
    Store.dispatch(new UpsertMany(CommonFeatureKeys.original, dataList));
});

strategy.set('deleteOriginal', (dataList: any[]) => {
    Store.dispatch(new RemoveMany(CommonFeatureKeys.original, dataList.map((original: any) => original.id)));
});
