import Header from './components/header';
import Content from './components/content';
import Modal from './components/modal';
// import server from './services/rest-server';
// import * as RSI from './services/rest-server.interface';

/**
 * Landing Page
 * ------------------------------
 * |          Header            |
 * |-----------------------------
 * |    proj info               |
 * |                            |
 * |    exp info                |
 * |    pipeline info           |
 * -----------------------------|
 *
 * Click EXP Card to EXP page
* ------------------------------
 * |          Header            |
 * |-----------------------------
 * |    overview   |            |
 * |               |   period   |
 * |----------------            |
 * |    detail     |            |
 * -----------------------------|
 */

export class App {

    public header: Header;
    public content: Content;
    public modal: Modal;


    public bootstrap() {
        this.header = new Header('#header');
        this.content = new Content();
        this.modal = new Modal('#modal-audio');
    }

    public setupEventHandlers() {
        this.header.setupEventHandlers();
        this.content.setupEventHandlers();
        this.modal.setupEventHandlers();
    }

    constructor() {
        // server.test.create<any>({events: 1})
        //     .done(function(data, textStatus){
        //         console.log(textStatus);
        //         console.log(data);
        //     })
        //     .fail(function(data, textStatus){
        //         console.log(textStatus);
        //         console.log(data);
        //     });

        // initialize your app here
        this.bootstrap();
        this.setupEventHandlers();
    }
}

new App();
