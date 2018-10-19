import subject from '../';
const initHelpers = () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn()
  })),
  store: {
    dispatch: jest.fn(),
    subscribeAction: jest.fn()
  }
});

describe('testing vuex socket sync plugin', () => {
  test('it maps event to action', () => {
    const answer = '42';
    const { io, store } = initHelpers();
    const modules = {
      test: {
        socket: {
          events: {
            answer: 'save'
          },
          actions: {}
        }
      }
    };
    subject(io, modules)(store);
    expect(io).toBeCalledWith('/test');
    const { on } = io.mock.results[0].value;
    expect(on).toBeCalled();
    expect(on.mock.calls[0][0]).toBe('answer');
    on.mock.calls[0][1](answer);
    expect(store.dispatch).toBeCalledWith('test/save', answer);
  });
  test('it maps event to identical action', () => {
    const answer = '42';
    const { io, store } = initHelpers();
    const modules = {
      test: {
        socket: {
          events: {
            answer: '='
          },
          actions: {}
        }
      }
    };
    subject(io, modules)(store);
    expect(io).toBeCalledWith('/test');
    const { on } = io.mock.results[0].value;
    expect(on).toBeCalled();
    expect(on.mock.calls[0][0]).toBe('answer');
    on.mock.calls[0][1](answer);
    expect(store.dispatch).toBeCalledWith('test/answer', answer);
  });

  test('it maps event to multiple actions', () => {
    const answer = '42';
    const { io, store } = initHelpers();
    const modules = {
      test: {
        socket: {
          events: {
            answer: [
              'save',
              'log/log'
            ]
          },
          actions: {}
        }
      }
    };
    subject(io, modules)(store);
    expect(io).toBeCalledWith('/test');
    const { on } = io.mock.results[0].value;
    expect(on).toBeCalled();
    expect(on.mock.calls[0][0]).toBe('answer');
    on.mock.calls[0][1](answer);
    expect(store.dispatch).toBeCalledWith('test/save', answer);
    expect(store.dispatch).toBeCalledWith('log/log', answer);
  });
  test('it maps action to event', () => {
    const question = 'how much is a fish?';
    const { io, store } = initHelpers();
    const modules = {
      test: {
        socket: {
          events: {},
          actions: {
            ask: 'question'
          }
        }
      }
    };
    subject(io, modules)(store);
    expect(io).toBeCalledWith('/test');
    expect(store.subscribeAction).toBeCalled();
    const { emit } = io.mock.results[0].value;
    store.subscribeAction.mock.calls[0][0]({
      type: 'test/ask',
      payload: question
    });
    expect(emit).toBeCalledWith('question', question);
  });
  test('it maps action to identical event', () => {
    const question = 'how much is a fish?';
    const { io, store } = initHelpers();
    const modules = {
      test: {
        socket: {
          events: {},
          actions: {
            ask: '='
          }
        }
      }
    };
    subject(io, modules)(store);
    expect(io).toBeCalledWith('/test');
    expect(store.subscribeAction).toBeCalled();
    const { emit } = io.mock.results[0].value;
    store.subscribeAction.mock.calls[0][0]({
      type: 'test/ask',
      payload: question
    });
    expect(emit).toBeCalledWith('ask', question);
  });
  test('it sends ack', () => {
    const question = 'how much is a fish?';
    const { io, store } = initHelpers();
    const modules = {
      test: {
        socket: {
          events: {},
          actions: {
            ask: '='
          }
        }
      }
    };
    subject(io, modules)(store);
    const { emit } = io.mock.results[0].value;
    const _ack = function () {};
    store.subscribeAction.mock.calls[0][0]({
      type: 'test/ask',
      payload: {
        question,
        _ack
      }
    });
    expect(emit).toBeCalledWith('ask', { question }, _ack);
    store.subscribeAction.mock.calls[0][0]({
      type: 'test/other',
      payload: {}
    });
  });
  test('it ignores module without socket', () => {
    const { io, store } = initHelpers();
    const modules = {
      test: {}
    };
    subject(io, modules)(store);
    expect(io.mock.calls.length).toBe(0);
  });
});