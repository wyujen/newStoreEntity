strategy.set(CommonFeatureKeys.target, (dataList: any[]) => {
    Store.dispatch(new UpsertMany(CommonFeatureKeys.target, dataList));
});

strategy.set('deletedTarget', (dataList: any[]) => {
    Store.dispatch(new RemoveMany(CommonFeatureKeys.target, dataList.map((target: any) => target.id)));
});
