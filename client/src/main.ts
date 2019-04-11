import Header from './components/header';
import Sidebar from './components/sidebar';
import Content from './components/content';
import Modal from './components/modal';
import Summary from './components/summary';

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
    public modal: Modal;
    public summary: Summary;

    public bootstrap() {
        this.header = new Header('#header');
        this.sidebar = new Sidebar('#sidebar');
        this.content = new Content('#content');
        this.modal = new Modal('#modal-audio');
        // this.summary = new Summary('#summary');
    }

    public setupEventHandlers() {
        this.header.setupEventHandlers();
        this.sidebar.setupEventHandlers();
        this.content.setupEventHandlers();
        this.modal.setupEventHandlers();
        // this.summary.setupEventHandlers();
    }

    constructor() {
        // initialize your app here
    }
}

let app = new App();
app.bootstrap();
app.setupEventHandlers();
