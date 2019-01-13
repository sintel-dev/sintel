import * as _ from 'lodash';
import * as Backbone from 'backbone';



export class BackboneEvents {
    constructor() {
        _.extend(this, Backbone.Events);
    }

    public on(eventName: string, callback?: Function, context?: any): any { return; }
    public off(eventName?: string, callback?: Function, context?: any): any { return; }
    public trigger(eventName: string, ...args: any[]): any { return; }
    public bind(eventName: string, callback: Function, context?: any): any { return; }
    public unbind(eventName?: string, callback?: Function, context?: any): any { return; }

    public once(events: string, callback: Function, context?: any): any { return; }
    public listenTo(object: any, events: string, callback: Function): any { return; }
    public listenToOnce(object: any, events: string, callback: Function): any { return; }
    public stopListening(object?: any, events?: string, callback?: Function): any { return; }
}

// add your global instance here

// example:
export let data = new BackboneEvents();
