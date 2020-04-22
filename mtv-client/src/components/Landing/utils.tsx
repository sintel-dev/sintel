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
};

// @TODO - later investigation for refactoring (fromIDToTag/fromTagToId)
export const tagSeq = [
  'Investigate',
  'Do not Investigate',
  'Postpone',
  'Problem',
  'Previously seen',
  'Normal',
  'Untagged',
];
const tagClassNames = ['investigate', 'not_investigate', 'postpone', 'problem', 'seen', 'normal', 'untagged'];

export const fromTagToClassName = (tag: string): string => {
  switch (tag) {
    case tagSeq[0]:
      return tagClassNames[0];
    case tagSeq[1]:
      return tagClassNames[1];
    case tagSeq[2]:
      return tagClassNames[2];
    case tagSeq[3]:
      return tagClassNames[3];
    case tagSeq[4]:
      return tagClassNames[4];
    case tagSeq[5]:
      return tagClassNames[5];
    default:
      return 'untagged';
  }
};

export const fromIDtoTag = (id: string): string => {
  switch (id) {
    case '1':
      return tagSeq[0];
    case '2':
      return tagSeq[1];
    case '3':
      return tagSeq[2];
    case '4':
      return tagSeq[3];
    case '5':
      return tagSeq[4];
    case '6':
      return tagSeq[5];
    default:
      return 'untagged';
  }
};

export const fromTagToID = (tag: string): string => {
  switch (tag) {
    case tagSeq[0]:
      return '1';
    case tagSeq[1]:
      return '2';
    case tagSeq[2]:
      return '3';
    case tagSeq[3]:
      return '4';
    case tagSeq[4]:
      return '5';
    case tagSeq[5]:
      return '6';
    default:
      return 'untagged';
  }
};

export const getTagColor = (tag: string): string => {
  let colorIdx: number | undefined;
  for (let i = 0; i < tagSeq.length; i += 1) {
    if (tagSeq[i] === tag) {
      colorIdx = i;
    }
  }
  if (colorIdx === undefined) {
    colorIdx = 6;
  }
  return colorSchemes.tag[colorIdx];
};
