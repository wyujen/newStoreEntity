strategy.set('deletedTarget', (dataList: any[]) => {
    Store.dispatch(new RemoveMany(CommonFeatureKeys.target, dataList.map((target: any) => target.id)));
  });

