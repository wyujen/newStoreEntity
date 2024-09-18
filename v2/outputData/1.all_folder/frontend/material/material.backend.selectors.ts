import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, MaterialState } from './material.reducer';

export const selectMaterialState = Cqrs.createFeatureSelector<MaterialState>(FeatureKey);
export const selectMaterialEntities = createSelector([selectMaterialState], (state: MaterialState) => Object.values(state.entities));
