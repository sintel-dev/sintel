import * as _ from 'lodash';


export class Helpers {
  public static extractName(a: string) {
    return a.substring(a.lastIndexOf('_') + 1);
  }

  constructor() {
    // init
  }
}


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
