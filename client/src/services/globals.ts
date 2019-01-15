// global config
export const gConfig = {
    colorScheme10: [
        '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3',
        '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'
    ]
}

// global session
interface Session {
    // list the potential used variable names here
    var1?: string;
}

export let gSession: Session = {}