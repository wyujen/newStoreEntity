strategy.set(CommonFeatureKeys.original, (dataList: any[]) => {
  Store.dispatch(new UpsertMany(CommonFeatureKeys.original, dataList));
});
