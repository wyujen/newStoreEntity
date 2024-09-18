
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, SalesOrderState } from './salesOrder.reducer';
import { Entities } from '@yaotai/interface';
import { SalesOrderRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectSalesOrderState = Cqrs.createFeatureSelector<SalesOrderState>(FeatureKey);
export const selectSalesOrderEntities = createSelector([selectSalesOrderState], (state: SalesOrderState) => Object.values(state.entities));

export const selectSalesOrderMapList = Cqrs.createRelationSelector<SalesOrderState>('salesOrder').pipe(map((state: SalesOrderState) => state.entities));

export const selectSalesOrders = createSelector(
  [selectSalesOrderMapList],
  (salesOrderEntities: Entities<SalesOrderRelation>) => Object.values(salesOrderEntities)
);
