// global config
export const gConfig = {
    colorScheme10: [
        '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3',
        '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'
    ]
};

// global session
interface Session {
    // list the potential used variable names here
    var1?: string;
}

export let gSession: Session = {};


export const colorSchemes = {
    severity5: [
        '#2c7bb6',  // blue, low
        '#abd9e9',
        '#ffffbf',
        '#fdae61',
        '#d7191c'   // red, high
    ],
    severity3: [
        '#91bfdb',  // light blue
        '#ffffbf',
        '#fc8d59'   // orange
    ]
};
