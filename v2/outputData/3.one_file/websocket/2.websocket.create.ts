strategy.set(CommonFeatureKeys.billOfMaterials, (dataList: any[]) => {
  Store.dispatch(new UpsertMany(CommonFeatureKeys.billOfMaterials, dataList));
});
strategy.set(CommonFeatureKeys.inventoryReceipt, (dataList: any[]) => {
  Store.dispatch(new UpsertMany(CommonFeatureKeys.inventoryReceipt, dataList));
});
