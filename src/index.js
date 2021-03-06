import React from 'react';
import ReactDOM from 'react-dom';
import QuizWidget from './components/Widget';
import QuizAdmin from './components/Admin';
import store from './redux/store';
import {init, back} from './redux/actions';
import {} from './redux/autosave';
import {Provider} from 'react-redux';
import openplatform from './redux/openplatform';

if (typeof window.openPlatformQuiz !== 'object') {
  window.openPlatformQuiz = {};
}

window.addEventListener('load', () => {
  if (typeof window.initOpenPlatformQuiz === 'function') {
    window.initOpenPlatformQuiz();
  }
});

async function mount(
  Cls,
  {elemId, onDone, openPlatformToken, quizId, extraSpacing}
) {
  openPlatformToken && (await openplatform.connect(openPlatformToken));
  store.dispatch(init({quizId, onDone, extraSpacing}));
  ReactDOM.render(
    <Provider store={store}>
      <Cls />
    </Provider>,
    document.getElementById(elemId)
  );
}

class Widget {
  constructor(args) {
    mount(QuizWidget, args);
  }
}

let historyCaptured = false;
class Admin {
  constructor(args) {
    if (!historyCaptured) {
      window.history.replaceState({current: false}, '', '');
      window.history.pushState({current: true}, '', '');
      window.addEventListener('popstate', ({state}) => {
        state = state || {};
        if (!state.current) {
          if (store.getState().get('quiz')) {
            store.dispatch(back());
            window.history.forward();
          } else {
            window.history.back();
          }
        }
      });
      historyCaptured = true;
    }
    mount(QuizAdmin, args);
  }
}

window.openPlatformQuiz.Widget = Widget;
window.openPlatformQuiz.Admin = Admin;
window.openPlatformQuiz.statisticsEvent = async ({
  openPlatformToken,
  quizId,
  type,
  subtype
}) => {
  openPlatformToken && (await openplatform.connect(openPlatformToken));
  if (quizId === undefined) throw new Error('missing quizId');
  if (type === undefined) throw new Error('missing type');
  if (subtype === undefined) throw new Error('missing subtype');
  openplatform.storage.put({
    _type: 'openplatform.quizStatistics',
    date: new Date().toISOString().slice(0, 10),
    quiz: quizId,
    type,
    subtype
  });
};

if (module.hot) {
  module.hot.accept(['./components/Widget', './components/Admin'], () =>
    window.initOpenPlatformQuiz()
  );
}
