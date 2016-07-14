/*
 * massr - timeline.js
 *
 * Copyright (C) 2016 by wasam@s production
 * You can modify and/or distribute this under GPL.
 */
import * as React from 'react';
import {Component} from 'flumpt';
import {MuiThemeProvider} from 'material-ui';
import Statement from './statement';

export const UPDATE_STATEMENTS = 'update-statements';

export default class Timeline extends Component {
	fetchStatements() {
		fetch('/index.json', {credentials: 'same-origin'}).
		then(res => res.json()).
		then(json => {
			return this.dispatch(UPDATE_STATEMENTS, json);
		}).
		catch(err => Promise.reject(err))
	}

	componentDidMount() {
		this.fetchStatements();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.flush) {
			this.fetchStatements();
		}
	}

	render() {
		const statements = this.props.statements.map(statement => {
			return(<Statement key={statement.id}
				statement={statement}
				me={this.props.me}
				settings={this.props.settings}
			/>);
		});

		return(<div className='statements'>{statements}</div>);
	}
};


