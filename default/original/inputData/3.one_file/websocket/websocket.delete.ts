strategy.set('deleteOriginal', (dataList: any[]) => {
    Store.dispatch(new RemoveMany(CommonFeatureKeys.original, dataList.map((original: any) => original.id)));
  });

