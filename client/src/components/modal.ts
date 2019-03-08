import * as pip from '../services/pip-client';
import * as ko from 'knockout';

class Modal {

    public eventId = ko.observable('');
    public transcript = ko.observable('');

    private modalEle: any;
    private SpeechRecognition: any;

    public setupEventHandlers() {
        let self = this;
        pip.modal.on('comment:start', eventId_ => {
            console.log(eventId_);
            self.eventId(eventId_);
            self.modalEle.modal('show');
        });
    }

    public record() {
        let self = this;

        if ('SpeechRecognition' in window) {
            console.log('speech recognition API supported');
        } else {
            console.log('speech recognition API not supported');
        }

        let recognition: SpeechRecognition = new self.SpeechRecognition();
        recognition.interimResults = true;
        recognition.continuous = true;

        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            self.transcript(speechToText);
        };

        recognition.start();
    }

    public save() {
        console.log('save');
    }

    constructor(eleId: string) {
        let self = this;

        // initialize Knockout Variables
        ko.applyBindings(this, $(eleId)[0]);

        // init modal
        self.modalEle = ($(eleId) as any);

        let window_ = window as any;
        self.SpeechRecognition = window_.webkitSpeechRecognition || window_.SpeechRecognition;
    }
}

export default Modal;
