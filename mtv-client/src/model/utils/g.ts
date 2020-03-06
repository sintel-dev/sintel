type G = {
  auth?: {
    token: string;
    uid: string;
  };
};

let g: G = {};

// TODO: decide whether to use window.sessionStorage instead
// window.sessionStorage

export default g;
