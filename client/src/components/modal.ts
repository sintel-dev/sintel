import * as pip from '../services/pip-client';
import * as ko from 'knockout';
import { Event } from '../services/rest-server.interface';
import server from '../services/rest-server';


class Modal {

    public event = ko.observable('');
    public datarun = ko.observable('');
    public dataset = ko.observable('');
    public eventFrom = ko.observable('');
    public eventTo = ko.observable('');
    public level = ko.observable('None');
    public transcript = ko.observable('');
    public comment = '';

    private modalEle: any;
    private SpeechRecognition: any;

    public setupEventHandlers() {
        let self = this;

        $('input[name="level"]').change(function() {
            let val = this.getAttribute('value');
            self.level(val);
        });

        pip.modal.on('comment:start', (eventInfo: Event) => {
            update(eventInfo);
            self.modalEle.modal('show');
        });

        pip.modal.on('comment:new', (eventInfo: Event) => {
            update(eventInfo);
            self.modalEle.modal('show');
        });

        function checkLevelFromScore(score: number): string {
            let level: number | string = 0;
            for (let i = 0; i <= 4; i += 1) {
                if (score > i) { level += 1; }
            }
            if (level === 0) { level = 'None'; }
            $('input[name="level"]').removeAttr('check');
            $('input[name="level"]').removeClass('active');
            $(`input[name="level"][value="${level}"]`).attr('check');
            $(`input[name="level"][value="${level}"]`).addClass('active');

            return String(level);
        }

        function update(eventInfo: Event) {
            self.event(eventInfo.id);
            self.datarun(eventInfo.datarun);
            self.dataset(eventInfo.dataset);
            self.eventFrom(new Date(eventInfo.start_time).toUTCString());
            self.eventTo(new Date(eventInfo.stop_time).toUTCString());
            self.level(checkLevelFromScore(eventInfo.score));

            // save event to server
            if (eventInfo.id === 'new') {
                server.events.create().done(eid => {
                    console.log('create');
                    server.comments.create();
                });
            } else {
                server.events.update().done(eid => {
                    console.log('update');
                    server.comments.create();
                });
            }

            // save comment to server
        }
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

        let oriComment = $('#comment').val();
        recognition.onresult = (event) => {
            const speechToText = event.results[0][0].transcript;
            self.transcript(speechToText);
            $('#comment').val(oriComment + speechToText + '. ');
        };

        recognition.onend = () => {
            self.transcript('');
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
