import { createSelector } from 'mycena-store';
import { Cqrs } from '../backend';
import { FeatureKey, OriginalState } from './original.reducer';

export const selectOriginalState = Cqrs.createFeatureSelector<OriginalState>(FeatureKey);
export const selectOriginalEntities = createSelector([selectOriginalState], (state: OriginalState) => Object.values(state.entities));
