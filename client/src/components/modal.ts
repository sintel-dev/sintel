import * as pip from '../services/pipClient';
import * as ko from 'knockout';
import * as RSI from '../services/server.interface';
import server from '../services/server';


class Modal {

  public event = ko.observable('');
  public datarun = ko.observable('');
  public dataset = ko.observable('');
  public eventFrom = ko.observable('');
  public eventTo = ko.observable('');
  public level = ko.observable('None');
  public transcript = ko.observable('');
  public comment = '';

  private eventInfo: RSI.Event;
  private commentInfo: RSI.Comment;
  private modalEle: any;
  private SpeechRecognition: any;

  public setupEventHandlers() {
    let self = this;

    $('input[name="level"]').change(function () {
      let val = this.getAttribute('value');
      self.level(val);
    });

    pip.modal.on('comment:start', (eventInfo: RSI.Event) => {
      update(eventInfo);
    });

    pip.modal.on('comment:new', (eventInfo: RSI.Event) => {
      update(eventInfo);
    });

    async function update(eventInfo: RSI.Event) {
      if (eventInfo.id === 'new') {
        $('#comment').val('');
      } else {
        self.commentInfo = await <any>server.comments.read({}, {
          event_id: eventInfo.id
        });
        self.commentInfo = self.commentInfo[0];
        $('#comment').val(self.commentInfo.text);
      }

      self.eventInfo = eventInfo;

      self.event(eventInfo.id);
      self.datarun(eventInfo.datarun);
      self.dataset(eventInfo.dataset);
      self.eventFrom(new Date(eventInfo.start_time).toUTCString());
      self.eventTo(new Date(eventInfo.stop_time).toUTCString());
      self.level(self.fromLevelToScore(eventInfo.score));

      self.modalEle.modal('show');
    }
  }

  public record() {
    let self = this;

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      console.log('speech recognition API supported');
    } else {
      console.log('speech recognition API not supported');
    }

    let recognition: SpeechRecognition = new self.SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.lang = 'en-US';

    let oriComment = $('#comment').val();
    self.transcript('');

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      self.transcript(speechToText);
      $('#comment').val(oriComment + speechToText + '. ');
    };

    recognition.onend = () => {
      recognition.stop();
      self.transcript('');
    };

    recognition.start();
  }

  public remove() {
    let self = this;
    server.events.del<RSI.Response>(self.event()).done(() => {
      self.modalEle.modal('hide');
      pip.content.trigger('event:update');
      // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);
    });
  }

  public modify() {
    let self = this;
    pip.content.trigger('event:modify', self.eventInfo);
    // pip.content.trigger('linechart:highlight:modify', {
    //     datarun: self.eventInfo.datarun,
    //     event: self.eventInfo
    // });
    self.modalEle.modal('hide');
  }

  public save() {
    let self = this;

    if (self.event() === 'new') {
      // create new
      server.events.create<RSI.Response>({
        start_time: Math.trunc((self.eventInfo.start_time - self.eventInfo.offset) / 1000),
        stop_time: Math.trunc((self.eventInfo.stop_time - self.eventInfo.offset) / 1000),
        score: self.fromScoreToLevel(self.level()),
        datarun: self.eventInfo.datarun
      }).done(eid => {
        self.modalEle.modal('hide');
        pip.content.trigger('event:update');
        // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);

        server.comments.create({
          event_id: eid,
          text: $('#comment').val()
        });
      });
    } else {
      // update existing
      server.events.update<RSI.Response>(self.event(), {
        start_time: Math.trunc((self.eventInfo.start_time - self.eventInfo.offset) / 1000),
        stop_time: Math.trunc((self.eventInfo.stop_time - self.eventInfo.offset) / 1000),
        score: self.fromScoreToLevel(self.level()),
        datarun: self.eventInfo.datarun
      }).done(eid => {
        self.modalEle.modal('hide');
        pip.content.trigger('event:update');
        // pip.content.trigger('linechart:highlight:update', self.eventInfo.datarun);

        if (self.commentInfo.id === 'new') {
          server.comments.create({
            event_id: eid,
            text: $('#comment').val()
          });
        } else {
          server.comments.update(self.commentInfo.id, {
            text: $('#comment').val()
          });
        }
      });
    }
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

  private fromLevelToScore(score: number): string {
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

  private fromScoreToLevel(level: string): number {
    if (level === 'None') {
      return 0;
    } else {
      return +level;
    }
  }
}

export default Modal;
