import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, SalesOrderState } from './salesOrder.reducer';

export const selectSalesOrderState = Cqrs.createFeatureSelector<SalesOrderState>(FeatureKey);
export const selectSalesOrderEntities = createSelector([selectSalesOrderState], (state: SalesOrderState) => Object.values(state.entities));
