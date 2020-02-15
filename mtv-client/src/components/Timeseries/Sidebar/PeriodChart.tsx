import * as React from 'react';

import './period-chart.scss';

type Props = {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
  data: any;
  classNames: string;
  label: string | number;
  onClickEvent: any;
  onMouseEnterEvent: any;
  onMouseLeaveEvent: any;
  tooltip?: {
    color: string;
  };
};

export class PeriodChart extends React.PureComponent<Props, any> {
  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any): void {
    this.buildDonut();
  }

  getTargetCircleRadius(level: 1 | 2 | 3): number {
    const { width } = this.props;
    if (level === 3) {
      return width / 2;
    }

    if (level === 2) {
      return width / 3;
    }

    return width / 6;
  }

  getTargetAxis(axis: 'x' | 'y') {
    const { width } = this.props;
    if (axis === 'x') {
      return <line x1={width / -2} x2={width / 2} y1="0" y2="0" strokeWidth="1" />;
    }

    return <line x1="0" x2="0" y1={width / -2} y2={width / 2} strokeWidth="1" />;
  }

  getCirclePath(): string {
    return ''; // @todo: implement this method
  }

  getLabelYValue(): number {
    return this.props.height - this.props.y;
  }

  buildDonut() {
    // @todo: implement this method
  }

  render() {
    const { x, y, classNames, id } = this.props;

    return (
      <g transform={`translate(${x}, ${y})`} className={classNames}>
        <g className="target">
          <circle r={this.getTargetCircleRadius(3)} strokeWidth="1" />
          <circle r={this.getTargetCircleRadius(2)} strokeWidth="1" />
          <circle r={this.getTargetCircleRadius(1)} strokeWidth="1" />
          {this.getTargetAxis('x')}
          {this.getTargetAxis('y')}
          <g className="donut" />
        </g>
        <path className="feature-area radial-cursor" id={`path_${id}`} d={this.getCirclePath()} />
        <clipPath id={`clip_${id}`}>
          <use xlinkHref={`#path_${id}`} />
        </clipPath>
        <circle
          clipPath={`url(#clip_${id})`}
          className="wrapper"
          r={this.getTargetCircleRadius(3)}
          fill="url(#blueGradient)"
        />
        <circle className="radial-cursor svg-tooltip" cx="0" cy="0" r="6" fill="#fff" strokeWidth={0} />
        <text
          className="radial-text-md"
          textAnchor="middle"
          alignmentBaseline="baseline"
          x="0"
          y={this.getLabelYValue()}
        >
          {this.props.label}
        </text>
      </g>
    );
  }
}
