import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  currentScreen,
  quizVariables,
  quizSettings,
  loading
} from '../redux/selectors';
import {screenAction} from '../redux/actions';
import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import quizElements from './quizElements';

const spacing = 16;

function renderElement(o, {onAction, vars}) {
  if (!quizElements[o.type]) {
    console.log('cannot find viewtype:', o.type);
    return;
  }
  return quizElements[o.type].view(o, {onAction, vars, renderElement});
}

export class Widget extends Component {
  render() {
    return (
      <Grid container spacing={spacing}>
        <Grid item xs={12}>
          <AppBar position="static" color="default">
            <Toolbar>
              <Typography variant="title" color="inherit">
                {this.props.quizTitle}
              </Typography>
            </Toolbar>
          </AppBar>
        </Grid>
        {this.props.ui &&
          this.props.ui.map((o, pos) => (
            <Grid key={pos} item xs={12}>
              {renderElement(o.toJS(), {
                onAction: this.props.onAction,
                vars: this.props.vars.toJS()
              })}
            </Grid>
          ))}
      </Grid>
    );
  }
}

export function mapStateToProps(state, ownProps) {
  const settings = quizSettings(state);
  const screen = currentScreen(state);
  return {
    loading: loading(state),
    vars: quizVariables(state),
    quizTitle: settings.get('title'),
    ui: screen.get('ui')
  };
}

export function mapDispatchToProps(dispatch) {
  return {
    onAction: action => dispatch(screenAction(action))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Widget);
