export const colorSchemes = {
  tag: [
    '#FFCD00', // investigate
    '#7CA8FF', // do not investigate
    '#A042FF', // postpone
    '#F64242', // problem
    '#F5FF00', // previously seen
    '#45F642', // normal
    '#C7C7C7', // untagged
  ],
  getColorName: function(name) {
    return '#426776';
  },
  getColorCode: function(name) {
    return '#426776';
  },
};

export let fromIDtoTag = (id: string): string => {
  switch (id) {
    case '1':
      return 'investigate';
    case '2':
      return 'do not investigate';
    case '3':
      return 'postpone';
    case '4':
      return 'problem';
    case '5':
      return 'previously seen';
    case '6':
      return 'normal';
    default:
      return 'untagged';
  }
};

export let fromTagToID = (tag: string): string => {
  switch (tag) {
    case 'investigate':
      return '1';
    case 'do not investigate':
      return '2';
    case 'postpone':
      return '3';
    case 'problem':
      return '4';
    case 'previously seen':
      return '5';
    case 'normal':
      return '6';
    default:
      return 'untagged';
  }
};
