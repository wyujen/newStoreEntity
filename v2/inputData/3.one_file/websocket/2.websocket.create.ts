strategy.set(CommonFeatureKeys.target, (dataList: any[]) => {
  Store.dispatch(new UpsertMany(CommonFeatureKeys.target, dataList));
});
