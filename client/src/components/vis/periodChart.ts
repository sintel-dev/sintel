import 'tooltipster';
import * as pip from '../../services/pip';
import * as _ from 'lodash';
import * as d3 from 'd3';
import * as dataDP from '../../services/dataProcessor';
import { colorSchemes } from '../../services/helpers';


export interface Option {
  // svg layout
  height?: number;
  width?: number;
  // animation
  duration?: number;
  delay?: number;
  // glyph parameters
  radius?: number;
  padding?: number;
  nCol?: number;  // number of glyphs each row
  size?: number;
  minSize?: number;
  missing?: boolean;   // whether highlight missing data
  circleStroke?: number; // used to calculate circle target stroke
  dayLevelTranslate?: number;
  isPeriodVisible?: boolean;
  colSpace?: number;
  rowSpace?: number;
  grouppedEvents?: Object;
}

export class PeriodChart extends pip.Events {

  public option: Option = {
    // svg layout
    height: null,
    width: null,
    // animation
    duration: 750,
    delay: 50,
    // glyph parameters
    nCol: null,
    padding: 18,
    size: 100,      // width = height = size (include padding)
    minSize: 6,
    missing: false,
    circleStroke: 1,
    dayLevelTranslate: 30,
    isPeriodVisible: true,
    colSpace: 10,
    rowSpace: 30,
    grouppedEvents: {}
  };

  private svgContainer: d3.Selection<HTMLElement, any, any, any>;
  private svg: d3.Selection<SVGElement, any, any, any>;

  constructor(
    ele: HTMLElement,
    private data: dataDP.PeriodChartDataEle[],
    option?: Option
  ) {
    super();
    let self = this;
    _.extend(self.option, option);
    self.svgContainer = d3.select<HTMLElement, any>(ele);
    self.option.width = self.option.width === null ? $(ele).innerWidth() : self.option.width;
    $(ele).height(($('.pchart').height() - 80) + 'px'); // firefox bug
    self.layoutGlyphs($(ele), data);

    // append svg to the container
    self.svg = self.svgContainer.append<SVGElement>('svg').attr('class', 'multi-period-chart');
    self.plot();
  }

  private layoutGlyphs(ele, data) {
    const elementWidth = this.option.width;
    const elementHeight = ele.height();
    const self = this;
    const {nCol, rowSpace, colSpace} = self.option;
    const rowsCount = Math.ceil(data[0].info.length / nCol);
    let diffSize = elementWidth - elementHeight;
    let size = 0;
    self.option.height = elementHeight;

    if (diffSize > 0) { // width is bigger than height
      size = (elementHeight - ((rowsCount * rowSpace))) / rowsCount;
      if (self.data[0].info[0].level === 'day') { // day level needs an additional top space
        size = (elementHeight - ((rowsCount * rowSpace) + self.option.dayLevelTranslate + (diffSize / rowsCount))) / rowsCount;
      }
    } else {
      size = (elementWidth - 2 - ((nCol - 1) * colSpace)) / nCol;
      if (size * rowsCount * rowSpace > elementHeight) {
        size = size - (elementHeight / (rowsCount * rowSpace));
      }
    }
    self.option.size = size;
  }

  private plot() {
    let self = this;
    const option = self.option;
    const { width, height, padding, size, nCol } = self.option;

    let outerRadius = (size / 2) - (padding / 2);
    let innerRadius = Math.max(outerRadius / 8, option.minSize);

    self.groupEvents();

    // layout setting
    _.each(self.data, d => {
      _.each(d.info, (dd, i) => {
        dd.col = i % nCol;
        dd.row = Math.floor(i / nCol);
      });
    });

    // define circular axis scale for each glyph
    let { angle, radius, area, area0 } = self.getScale(innerRadius, outerRadius);

    // zoom
    let { zoom, zoomRect } = self.addZoom(width, height);
    zoom.on('zoom', zoomHandler);
    let zoomG = self.svg.append('g');

    let g = zoomG.append('g');
    self.normalize();
    // add glyphs
    let { featurePlot } = self.addGlyphs(g, angle, radius, area, area0, size, innerRadius, outerRadius);

    // add labels
    let { label1 } = self.addLabels(g, size);

    // ************  events  ************
    self.on('update', update);
    self.on('event:update', eventUpdateHandler.bind(self));
    self.on('showPeriod', self.showPeriod);

    // ************  event handlers  ************
    function update(o: dataDP.PeriodChartDataEle[]) {
      if (o !== null) {
        self.data = o;
      } else {
        o = self.data;
      }
      self.normalize();
      self.groupEvents();

      if (o[0].info[0].level === 'year') {
        let newHeight = size * Math.ceil((o[0].info.length) / nCol);
        self.svg.attr('height', newHeight);
        zoomRect.attr('height', newHeight).call(zoom);
      }

      if (o[0].info[0].level === 'month') {
        label1.text(o[0].info[0].parent.name);
      }

      if (o[0].info[0].level === 'day') {
        label1.text(`${o[0].info[0].parent.name} ${(o[0].info[0].parent.parent.name)}`);
        let [mm, yy] = [
          o[0].info[0].parent.name,
          o[0].info[0].parent.parent.name
        ];
        let offset = new Date(`${mm} 1, ${yy} 00:00:00`).getDay();
        let newHeight = size * Math.ceil((o[0].info.length + offset) / nCol) + self.option.dayLevelTranslate;
        self.svg.attr('height', newHeight);

        zoom.translateExtent([[0, 0], [width, newHeight]]).extent([[0, 0], [width, newHeight]]);
        zoomRect.attr('height', newHeight).call(zoom);
        _.each(self.data, d => {
          _.each(d.info, (dd, i) => {
            let dt = new Date(`${mm} ${i + 1}, ${yy} 00:00:00`);
            dd.col = (i + offset) % nCol;
            dd.row = Math.floor((i + offset) / nCol);
          });
        });
      } else {
        _.each(self.data, d => {
          _.each(d.info, (dd, i) => {
            dd.col = i % nCol;
            dd.row = Math.floor(i / nCol);
          });
        });
      }

      g.selectAll(`.feature-cell`).remove();
      _.each(self.data, (data, i) => {
        let _g = g.selectAll(`.feature-cell-${data.name}`).data(data.info);

        // append month
        _g.enter().append('g')
          .merge(_g as any)
          .attr('class', `feature-cell feature-cell-${data.name}`)
          .attr('transform', d => {
            let translateCoords = [];
            if (d.level === 'day') {
              translateCoords = [
                d.col !== 0 ? (d.col * (size + self.option.colSpace) + size / 2) : (size + 2) / 2,
                d.row !== 0 ?
                  (d.row * (size + self.option.rowSpace) + size / 2 + self.option.dayLevelTranslate + self.option.rowSpace) :
                size / 2 + self.option.rowSpace + self.option.dayLevelTranslate
              ];
            } else {
              translateCoords = [
                d.col !== 0 ? (d.col * (size + self.option.colSpace) + size / 2) : size / 2,
                d.row !== 0 ? (d.row * (size + self.option.rowSpace) + size / 2) : ((size + 2) / 2)
              ];
            }

            return `translate(${translateCoords})`;
          })
          .each(function (d, count) {
            const randomID = self.generateRandomID();
            featurePlot(d3.select(this), d, data.name, randomID);
          });
        _g.exit().remove();
      });
    }

    function eventUpdateHandler(events) {
      self.data[0].events = events;
      update(self.data);
    }

    function zoomHandler() {
      zoomG.attr('transform', d3.event.transform);
    }
  }

  private showPeriod(isVisible) {
    this.option.isPeriodVisible = isVisible;

    // @TODO - avoid triggering rerendering of the entire chart
    this.trigger('update', this.data);
  }

  private normalize() {
    let self = this;
    let mmin = Number.MAX_SAFE_INTEGER;
    let mmax = Number.MIN_SAFE_INTEGER;
    let clones = _.cloneDeep(self.data);
    _.each(clones, d => {
      for (let i = 0; i < d.info.length; i++) {
        for (let j = 0; j < d.info[i].bins.length; j++) {
          if (d.info[i].counts[j] === 0) { continue; }
          mmin = mmin > d.info[i].bins[j] ? d.info[i].bins[j] : mmin;
          mmax = mmax < d.info[i].bins[j] ? d.info[i].bins[j] : mmax;
        }
      }
    });

    let nm = d3.scaleLinear()
      .domain([mmin, mmax])
      .range([0, 1]);

    _.each(clones, d => {
      for (let i = 0; i < d.info.length; i++) {
        for (let j = 0; j < d.info[i].bins.length; j++) {
          if (d.info[i].counts[j] === 0) { continue; }
          d.info[i].bins[j] = nm(d.info[i].bins[j]);
        }
      }
    });
    self.data = clones;
  }

  private addZoom(width, height) {
    let self = this;

    let zoom = d3.zoom()
      .scaleExtent([1, 6])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);

    let zoomRect;
    zoomRect = self.svg.append('rect')
      .attr('class', 'zoom')
      .attr('width', width)
      .attr('height', height)
      .call(zoom);

    return { zoom, zoomRect };
  }

  private getScale(ir, or) {
    let angle = d3.scaleLinear()
      .range([0, 2 * Math.PI]);

    let radius = d3.scaleLinear()
      .range([ir, or])
      .clamp(true);

    let area = d3.areaRadial<number>()
      .angle((d, i) => angle(i))
      .innerRadius(d => radius(0))
      .outerRadius(d => radius(d))
      .curve(d3.curveCardinalClosed);

    let area0 = d3.areaRadial<number>()
      .angle((d, i) => angle(i))
      .innerRadius(d => radius(0))
      .outerRadius(d => radius(0))
      .curve(d3.curveCardinalClosed);

    return { angle, radius, area, area0 };
  }

  private addLabels(g, size) {
    const textOffset = 10;
    let self = this;
    if (self.data[0].info[0].level === 'day') {
      let names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      g.append('g')
        .attr('class', 'weekdays')
        .attr('transform', 'translate(0, 35)')
        .selectAll('.weekday-text')
        .data(_.range(7))
        .enter()
        .append('text')
        .attr('class', 'radial-text-md weekday-text')
        .attr('x', d => d * (size + self.option.colSpace) + size / 2 - textOffset)
        .attr('y', 0)
        .text(d => names[d]);
    }

    let label1 = self.svg.append('text')
      .attr('class', 'radial-text-md')
      .attr('x', 1)
      .attr('y', 14)
      .text('');

    let label2 = self.svg.append('text')
      .attr('class', 'radial-text-md')
      .attr('x', 1)
      .attr('y', 30)
      .text('');

    return { label1, label2 };
  }

  private generateRandomID() {
    return Math.random().toString(36).substr(2, 9);
  }

  private toTimestamp = function (strDate) {
    let datum = Date.parse(strDate);
    return datum / 1000;
  };

  private groupEvents() {
      const result = {};
      const self = this;
      const events = self.data[0].events;
      events.forEach(event => {
          const {start_time, stop_time} = event;
          const eventStartYear = new Date(start_time * 1000).getFullYear();
          const eventStopYear = new Date(stop_time * 1000).getFullYear();
          let currentYear = eventStartYear;

          while (currentYear <= eventStopYear) {
            const yearStartDate = self.toTimestamp(`01/01/${currentYear} 00:00:00`);
            const yearStopDate = self.toTimestamp(`12/31/${currentYear} 23:59:59`);
            const eventProps = {
              id: event.id,
              start_time: start_time >= yearStartDate ? start_time : yearStartDate,
              stop_time: stop_time <= yearStopDate ? stop_time : yearStopDate,
              tag: event.tag,
              score: event.score
            };

            if (result[currentYear]) {
              result[currentYear]['events'][event.id] = eventProps;
            } else {
              result[currentYear] = {
                events: {[event.id]: eventProps},
                months: {}
              };
            }

            const eventStartMonth = new Date(result[currentYear].events[event.id].start_time * 1000).getMonth() + 1;
            const eventStopMonth = new Date(result[currentYear].events[event.id].stop_time * 1000).getMonth() + 1;
            let currentMonth = eventStartMonth;

            while (currentMonth <= eventStopMonth) {
                const maxDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();
                const monthDateStart = self.toTimestamp(`${currentMonth}/01/${currentYear} 00:00:00`);
                const monthDateStop = self.toTimestamp(`${currentMonth }/${maxDaysInMonth}/${currentYear} 23:59:59`);

                let month = {
                  id: event.id,
                  start_time: start_time >= monthDateStart ? start_time : monthDateStart,
                  stop_time: stop_time <= monthDateStop ? stop_time : monthDateStop,
                  tag: event.tag,
                  score: event.score,
                  days: {}
                };

                const eventStartDay = new Date(month.start_time * 1000).getDate();
                const eventStopDay = new Date(month.stop_time * 1000).getDate();
                let currentDay = eventStartDay;

                result[currentYear].months[currentMonth] = month;

                while (currentDay <= eventStopDay) {
                    const dayDateStart = self.toTimestamp(`${currentMonth}/${currentDay}/${currentYear} 00:00:00`);
                    const dayDateStop = self.toTimestamp(`${currentMonth}/${currentDay}/${currentYear} 23:59:59`);

                    let day = {
                      id: event.id,
                      start_time: start_time >= dayDateStart ? start_time : dayDateStart,
                      stop_time: stop_time <= dayDateStop ? stop_time : dayDateStop,
                      tag: event.tag,
                      score: event.score,
                    };

                    result[currentYear].months[currentMonth].days[currentDay] = day;
                    currentDay++;
                }
                currentMonth++;
            }
            currentYear++;
        }
      });
      self.option.grouppedEvents = result;
  }

  private drawArc = (eventProps, interval, arc, target) => {
    const self = this;

    const PI = Math.PI;
    const secondsInMonth = 2629743.83;
    const circleMonths = (2 * PI) / 12;
    const {start_time, stop_time, tag, score} = eventProps;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNumber = months.indexOf(interval.period.month);
    const daysInMonth = new Date(Number(interval.period.year), monthNumber, 0).getDate();
    const circleDays = (2 * PI) / daysInMonth;
    const secondsInDay = 86400;
    const circleHours = (2 * PI) / 24;
    const tagSeq = ['investigate', 'do not investigate', 'postpone', 'problem', 'previously seen', 'normal', 'untagged'];
    const rootEvent = self.data[0].events.filter(event => event.id === eventProps.id)[0];
    const startDate = new Date(rootEvent.start_time * 1000).toDateString();
    const stopDate = new Date(rootEvent.stop_time * 1000).toDateString();
    const arcClassName = `${startDate.replace(/ /g, '_')}`;

    let arcStart = 0;
    let arcStop = 0;
    let base = 0;

    if (interval.level === 'year') {
      base = new Date(Number(interval.period.year)).getTime() / 1000;
      arcStart = ((start_time - base) / secondsInMonth) * circleMonths;
      arcStop = ((stop_time - base) / secondsInMonth) * circleMonths;
    }

    if (interval.level === 'month') {
      base = new Date(Number(interval.period.year), monthNumber).getTime() / 1000;
      arcStart = ((start_time - base) / secondsInDay) * circleDays;
      arcStop = ((stop_time - base) / secondsInDay) * circleDays;
    }

    if (interval.level === 'day') {
      base = new Date(Number(interval.period.year), monthNumber, interval.period.day).getTime() / 1000;
      arcStart = ((start_time - base) / 3600) * circleHours;
      arcStop = ((stop_time - base) / 3600) * circleHours;
    }

    const getTagColor = (tagType: string): string => {
      let colorIdx = 0;
      for (let i = 0; i < tagSeq.length; i += 1) {
        if (tagSeq[i] === tagType) {
          colorIdx = i;
        }
      }
      return colorSchemes.tag[colorIdx];
    };

    arc
      .startAngle(arcStart)
      .endAngle(arcStop);

    target
      .append('path')
      .attr('class' , () =>
        self.option.isPeriodVisible ? `circle-arc ${arcClassName} visible` : `circle-arc ${arcClassName}`
      )
      .attr('d', arc)
      .attr('fill', getTagColor(tag || 'untagged'))
      .attr('stroke', 3)
      .on('mouseover', function() {
        $(`.${arcClassName}`).addClass('active');
      })
      .on('mouseout', function() {
        $(`.${arcClassName}`).removeClass('active');
      });

    $('.circle-arc').tooltipster({
      'maxWidth': 170,
      contentAsHTML: true,
      arrow: false,
      side: 'right',
      trigger: 'custom',
      debug: false,
      triggerOpen: {
        click: true,
        tap: true,
        mouseenter: true
      },
      triggerClose: {
        click: true,
        scroll: false,
        tap: true,
        mouseleave: true
      },

      functionInit: function (instance) {
        let tooltipContent = `
            <ul class="tooltip-events">
              <li class="events">${tag || 'untagged'} </li>
              <li>
                <span>START</span>
                <span>${startDate} </span>
              </li>
              <li>
                <span>END</span>
                <span>${stopDate}</span>
              </li>
            </ul>`;
        instance.content(tooltipContent);
      }
    });
  }

  private drawEvents(level, period, arc, target) {
    let filteredEvents = {};
    const self = this;
    const grouppedEvents = self.option.grouppedEvents;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = level === 'month' || level === 'day' ? months.indexOf(period.month) + 1 : null;

    if (level === 'year') {
      filteredEvents = grouppedEvents[period.year] !== undefined ? grouppedEvents[period.year].events : null;
      filteredEvents &&
      Object.keys(filteredEvents).forEach((eventKey) =>
        self.drawArc(filteredEvents[eventKey], {level, period}, arc, target)
      );
    }

    if (level === 'month') {
      filteredEvents = grouppedEvents[period.year] !== undefined ? grouppedEvents[period.year].months[month] : null;
      filteredEvents && self.drawArc(filteredEvents, {level, period}, arc, target);
    }

    if (level === 'day') {
      const eventExist = grouppedEvents[period.year] !== undefined &&
                        grouppedEvents[period.year].months !== undefined &&
                        grouppedEvents[period.year].months[month] !== undefined || null;

      filteredEvents = eventExist &&  grouppedEvents[period.year].months[month].days[period.day];
      filteredEvents && self.drawArc(filteredEvents, {level, period}, arc, target);
    }
  }

  private addGlyphs(g, angle, radius, area, area0, size, innerRadius, outerRadius) {
    let self = this;
    let option = self.option;

    // plot data on each station
    _.each(self.data, (data, count) => {
      let cell = g
        .selectAll(`.feature-cell-${data.name}`)
        .data(data.info)
        .enter()
        .append('g')
        .attr('class', `feature-cell feature-cell-${data.name}`)
        .attr('transform', d => {
          let translateCoords = [
            d.col !== 0 ? (d.col * (size + self.option.colSpace) + size / 2) : size / 2,
            d.row !== 0 ? (d.row * (size + self.option.rowSpace) + size / 2) : (size + 2) / 2
          ];

          return `translate(${translateCoords})`;
        })
        .each(function (d) {
          const randomID = self.generateRandomID();
          featurePlot(d3.select(this), d, data.name, randomID);
        });
    });

    return { featurePlot };

    function featurePlot(_cell, o: dataDP.ChartDataEleInfoEle, stationName: string, id: any) {
      const { circleStroke } = self.option;

      // create the 'target' svg circles
      let target = _cell.append('g').attr('class', 'target');
      const ratio = size / 3 - circleStroke / 2;
      const targetRadius = size / 2 - circleStroke / 2;
      const strokeWidth = size / 2;
      const arc = d3.arc().innerRadius(targetRadius - 2).outerRadius(targetRadius + 2);

      // Extend the domain slightly to match the range of [0, 2π].
      angle.domain([0, o.bins.length - 0.05]);
      // angle.domain([0, o.bins.length - 0.88]);

      // notice all the data has been normalized to [0, 1]
      radius.domain([0, 1]);

      let path = _cell.append('path')
        .datum(o.bins)
        .attr('class', 'feature-area radial-cursor')
        .attr('id', `path_${id}`)
        .attr('d', area0)
        .on('click', () => {
          if (o.children) {
            self.trigger('select', o);
          }
        });

      let clipPath = _cell.append('clipPath');
      clipPath
        .attr('id', `clip_${id}`)
        .append('use')
        .attr('xlink:href', `#path_${id}`);

      path.transition()
        .duration(option.duration)
        .attr('d', area);

      path.append('title')
        .text(o.name);

      target.append('circle')
        .attr('r', targetRadius)
        .attr('stroke-width', circleStroke);

      target.append('circle')
        .attr('r', targetRadius - ratio / 2)
        .attr('stroke-width', circleStroke);
      target.append('circle')
        .attr('r', targetRadius - ratio)
        .attr('stroke-width', circleStroke);

      // vertical/horizontal lines for the 'target'
      target.append('line')
        .attr('x1', -(strokeWidth))
        .attr('x2', strokeWidth)
        .attr('stroke-width', circleStroke)
        .attr('y1', 0)
        .attr('y2', 0);

      target.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('stroke-width', circleStroke)
        .attr('y1', -(strokeWidth))
        .attr('y2', strokeWidth);

      _cell.append('circle')
        .attr('clip-path', `url(#clip_${id})`)
        .attr('class', 'wrapper')
        .attr('r', strokeWidth)
        .attr('fill', 'url(#blueGradient)');

      _cell.append('circle')
        .attr('class', 'radial-cursor svg-tooltip')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', innerRadius)
        .style('fill', 'white')
        .style('stroke-width', 0)
        .on('click', (d) => {
          self.trigger('select', o);
        })
        .attr('title',
          '["investigate", "do not investigate", "postpone", "problem", "previously seen", "normal", "untagged"]'
        ); // should be gathered from API

      if (self.data[0].events.length) {

        if (o.level === 'year') {
          const year = o.name;
          self.drawEvents('year', {year}, arc, target);
        }

        if (o.level === 'month') {
          const year = o.parent.name;
          const month = o.name;
          self.drawEvents('month', {year, month}, arc, target);
        }

        if (o.level === 'day') {
          const year = o.parent.parent.name;
          const month = o.parent.name;
          const day = o.name;
          self.drawEvents('day', {year, month, day}, arc, target);
        }

        _cell.append('text')
          .attr('class', 'radial-text-md')
          .text(o.name)
          .attr('x', function (data, arg, svgEls) {
            // tslint:disable-next-line
            const textOffset = ~~(svgEls[0].getBBox().width);
            return -(textOffset / 2);
          })
          .attr('y', (data, arg, svgEls) => {
            // tslint:disable-next-line
            const textOffset = ~~(svgEls[0].getBBox().height);
            return size / 2 + textOffset;
          });

        if (o.level === 'year') {
          $('.svg-tooltip').tooltipster({
            'maxWidth': 270,
            contentAsHTML: true,
            arrow: false,
            side: 'right',
            trigger: 'custom',
            debug: false,
            triggerOpen: {
              click: true,
              tap: true,
              mouseenter: true
            },
            triggerClose: {
              click: true,
              scroll: false,
              tap: true,
              mouseleave: true
            },

            functionInit: function (instance, helper) {
              const content = instance.content();
              const events = JSON.parse(content);
              let newContent = '<ul><li class="events">Events</li>';
              events.map((event, index) => {
                newContent += `<li><i class="event_${index}"/>${event}</li>`;
              });
              newContent += '</ul>';
              instance.content(newContent);
            }
          });
        }

        if (option.missing) {
          let missedData = [];
          let area00 = d3.areaRadial<number>()
            .angle((d, i) => angle(d))
            .innerRadius(d => radius(0))
            .outerRadius(d => radius(0))
            .curve(d3.curveCardinal);
          _.each(o.bins, (b, bi) => {
            if (o.counts[bi] === 0) {
              missedData.push(bi);
              _cell.append('path')
                .datum(missedData)
                .attr('class', 'missed-bins')
                .attr('d', area00([bi, bi + 1]))
                .attr('fill', '#b70e13')
                .attr('stroke', '#b70e13')
                .attr('stroke-width', 2)
                .attr('stroke-opacity', 0.7);
            }
          });
        }
      }
    }
  }
}

