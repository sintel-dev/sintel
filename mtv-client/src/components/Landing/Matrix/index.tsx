import React from 'react';
import Matrix from './Matrix';
import { ExperimentDataType } from '../../../model/types';
import { TagStats, Scale } from './types';

const drawMatrix = (experiment: ExperimentDataType, tagStats: TagStats, scale: Scale) => (
  <Matrix experiment={experiment} tagStats={tagStats} scale={scale} />
);

export default drawMatrix;
export * from './types';
