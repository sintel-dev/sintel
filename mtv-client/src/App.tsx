import React from 'react';
import { Route, Switch, withRouter, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Header from './components/Header/Header';
import Landing from './components/Landing/Landing';
import Experiment from './components/Timeseries/Overview/Experiment';

const transtitionTimeOut = { enter: 1000, exit: 1000 };

const App: React.FC = () => {
  const location = useLocation();
  const animateDirection = location.pathname === '/' ? 'animate-left' : 'animate-right';
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
            <Switch location={location}>
              <Route exact path="/" component={Landing} />
              <Route exact path="/experiment/:id" component={Experiment} />
            </Switch>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

export default withRouter(App);
