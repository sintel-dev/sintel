import Header from './components/header';
import Sidebar from './components/sidebar';
import Content from './components/content';
import Modal from './components/modal';

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

    public bootstrap() {
        this.header = new Header('#header');
        this.sidebar = new Sidebar('#sidebar');
        this.content = new Content('#content');
        this.modal = new Modal('#modal-audio');
    }

    public setupEventHandlers() {
        this.header.setupEventHandlers();
        this.sidebar.setupEventHandlers();
        this.content.setupEventHandlers();
        this.modal.setupEventHandlers();
    }

    constructor() {
        // initialize your app here
        this.bootstrap();
        this.setupEventHandlers();
    }
}

new App();
