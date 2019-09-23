import * as _ from 'lodash';


export const colorSchemes = {
  tag: [
    '#FFCD00', // investigate
    '#7CA8FF', // do not investigate
    '#A042FF', // postpone
    '#F64242', // problem
    '#F5FF00', // previously seen
    '#45F642', // normal
    '#C7C7C7'  // untagged
  ],
  getColorName: function (name) {
    return '#426776';
  },
  getColorCode: function (name) {
    return '#426776';
  }
};


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
