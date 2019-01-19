import * as _ from 'lodash';

// used for karma test
export class Calculator {
    public static Sum(a: number[]): number {
        return _.sum(a);
    }

    public static Difference(a: number, b: number): number {
        let c = a - b;
        return c;
    }
}
