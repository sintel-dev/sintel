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

export let fromIDtoTag = (id: string): string => {
  switch (id) {
    case '1':
      return 'investigate';
      break;
    case '2':
      return 'do not investigate';
      break;
    case '3':
      return 'postpone';
      break;
    case '4':
      return 'problem';
      break;
    case '5':
      return 'previously seen';
      break;
    case '6':
      return 'normal';
      break;
    default:
      return 'untagged';
  }
};

export let fromTagToID = (tag: string): string => {
  switch (tag) {
    case 'investigate':
      return '1';
      break;
    case 'do not investigate':
      return '2';
      break;
    case 'postpone':
      return '3';
      break;
    case 'problem':
      return '4';
      break;
    case 'previously seen':
      return '5';
      break;
    case 'normal':
      return '6';
      break;
    default:
      return 'untagged';
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
