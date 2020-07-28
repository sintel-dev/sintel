import rootReducer from '../reducers/index';
import { DatasetDataType } from './dataset';
import { DatarunDataType } from './datarun';
import { EventDataType } from './event';

export type RootState = ReturnType<typeof rootReducer>;

export type DataResponse = {
    datasets: DatasetDataType[];
    dataruns: DatarunDataType[];
    events: Array<EventDataType[]>;
    predictions: Array<{
        names: string[];
        data: Array<number[]>;
        offset: number;
    }>;
    raws: Array<{
        data: Array<Array<{ means: number[]; counts: number[] }>>;
    }>;
};

// every reducer has its own type file
export * from './datarun';
export * from './dataset';
export * from './experiment';
export * from './experimentData';
export * from './comment';
export * from './event';
export * from './pipeline';
export * from './project';
export * from './aggregation';
