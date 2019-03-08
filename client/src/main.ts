import Header from './components/header';
import Sidebar from './components/sidebar';
import Content from './components/content';

/**
 * Basic layout
 * ------------------------------
 * |          Header            |
 * |-----------------------------
 * |        |                   |
 * | Side   |     Content       |
 * | Bar    |                   |
 * |        |                   |
 * -----------------------------|
 */

export class App {

    public header: Header;
    public sidebar: Sidebar;
    public content: Content;

    public bootstrap() {
        this.header = new Header('#header');
        this.sidebar = new Sidebar('#sidebar');
        this.content = new Content('#content');
    }

    public setupEventHandlers() {
        this.header.setupEventHandlers();
        this.sidebar.setupEventHandlers();
        this.content.setupEventHandlers();
    }

    constructor() {
        // initialize your app here
    }
}

let app = new App();
app.bootstrap();
app.setupEventHandlers();
