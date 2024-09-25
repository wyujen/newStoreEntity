strategy.set(CommonFeatureKeys.billOfMaterials, (dataList: any[]) => {
    Store.dispatch(new UpsertMany(CommonFeatureKeys.billOfMaterials, dataList));
});

strategy.set('deletedBillOfMaterials', (dataList: any[]) => {
    Store.dispatch(new RemoveMany(CommonFeatureKeys.billOfMaterials, dataList.map((billOfMaterials: any) => billOfMaterials.id)));
});
strategy.set(CommonFeatureKeys.inventoryReceipt, (dataList: any[]) => {
    Store.dispatch(new UpsertMany(CommonFeatureKeys.inventoryReceipt, dataList));
});

strategy.set('deletedInventoryReceipt', (dataList: any[]) => {
    Store.dispatch(new RemoveMany(CommonFeatureKeys.inventoryReceipt, dataList.map((inventoryReceipt: any) => inventoryReceipt.id)));
});
