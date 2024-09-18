
import { Cqrs } from '../frontend';
import { createSelector } from 'mycena-store';
import { FeatureKey, OriginalState } from './original.reducer';
import { Entities } from '@yaotai/interface';
import { OriginalRelation } from '@yaotai/relation';
import { map } from 'rxjs';

export const selectOriginalState = Cqrs.createFeatureSelector<OriginalState>(FeatureKey);
export const selectOriginalEntities = createSelector([selectOriginalState], (state: OriginalState) => Object.values(state.entities));

export const selectOriginalMapList = Cqrs.createRelationSelector<OriginalState>('original').pipe(map((state: OriginalState) => state.entities));

export const selectOriginals = createSelector(
  [selectOriginalMapList],
  (originalEntities: Entities<OriginalRelation>) => Object.values(originalEntities)
);
