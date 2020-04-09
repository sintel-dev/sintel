import React from 'react';
import { Switch, Route } from 'react-router';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Landing from './Landing';
import Header from '../Header/Header';
import Experiment from '../Timeseries/Overview/Experiment';

const transtitionTimeOut = { enter: 1000, exit: 1000 };

export interface DashboardProps {
  location: {
    pathname: string;
  };
}

const Dashboard = (props: DashboardProps) => {
  const { location } = props;
  const animateDirection = location.pathname === '/' ? 'animate-left' : 'animate-right';
  // return (
  //   <div id="content-wrapper">
  //     <Header />
  //     <Switch>
  //       <Route path="/experiment/:id" exact component={Experiment} />
  //       <Route path="/" component={Landing} />
  //     </Switch>
  //   </div>
  // );
  return (
    <div id="content-wrapper">
      <Header />
      <TransitionGroup component="div" className="page-slider">
        <CSSTransition
          key={location.pathname}
          timeout={transtitionTimeOut}
          classNames="page-slider"
          mountOnEnter
          unmountOnExit={false}
          transitionname="page-slider"
        >
          <div className={animateDirection}>
            <Switch>
              <Route path="/experiment/:id" exact component={Experiment} />
              <Route path="/" component={Landing} />
            </Switch>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

export default Dashboard;
