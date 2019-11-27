import React, {Component} from 'react';
import {fetchProjects} from '../../model/actions/api';
import {projectsList} from '../../model/selectors/projects';
import {connect} from 'react-redux';
import './Landing.scss';

class Landing extends Component {
    componentDidMount(){
        this.props.fetchProjectsList();
    }

    renderProject(project) {
        
        return (
            <div className="cell" key={project.name}>
                <h3>{project.name}</h3>
                <div className="project-data">
                    <ul>
                        <li>{project.signalNum} Signals</li>
                        <li>{project.pipelines.length} unique pipelines</li>
                    </ul>
                    <ul>
                        <li>{project.experimentNum} experiments</li>
                    </ul>
                </div>
            </div>
        )
    }

    render(){
        const {projectsList} = this.props;

        console.log(this.props);
        
        return (
            projectsList && projectsList.length ? 
            <div className="project-row">
                <h2>Datasets</h2>
                <div className="project-wrapper">
                    { projectsList.map(project => this.renderProject(project)) }
                </div>
            </div>
            : <p>No project found</p>
        )
    }


}


export default connect(state => ({
    projectsList: projectsList(state)
}),
dispatch => ({
    fetchProjectsList: () => dispatch(fetchProjects())
}))(Landing);