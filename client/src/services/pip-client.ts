import * as _ from 'lodash';
import {Events as BackboneEvents} from 'backbone';


export class Events {
    constructor() {
        _.extend(this, BackboneEvents);
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

export let app = new Events();
export let header = new Events();
export let sidebar = new Events();
export let content = new Events();
