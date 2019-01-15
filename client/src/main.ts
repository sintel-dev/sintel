import * as _ from 'lodash';
import Header from './components/header';
import Dashboard from './components/dashboard';
import Content from './components/content';

/**
 * basic layout
 * ------------------------------
 * |          header            |
 * |-----------------------------
 * |        |                   |
 * | Dash   |     Content       |
 * | Board  |                   |
 * |        |                   |
 * -----------------------------|
 */

class App {

    public header: Header;
    public dashboard: Dashboard;
    public content: Content;

    public bootstrap() {
        // init header
        this.header = new Header('#hearder');
        this.dashboard = new Dashboard('#dashboard');
        this.content = new Content('#content');
    }

    constructor() {
        // initialize your app here
    }
}

let app = new App();
app.bootstrap();



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
