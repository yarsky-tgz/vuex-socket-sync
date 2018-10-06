const defaultOptions = {
  socketPrefix: '/'
};
const prefix = (target, name) => target.indexOf('/') !== -1 ? target : name + '/' + target;
const convert = (target, index, name) => prefix(target === '=' ? index : target, name);
export default (io, modules, optionsOverride = {}) => store => {
  const spaces = {};
  const space = name => spaces.name || (spaces.name = io(options.socketPrefix + name));
  const on = ([ nsp, event ], handler) => space(nsp).on(event, handler);
  const actionsMap = {};
  const options = Object.assign({}, defaultOptions, optionsOverride);
  Object.keys(modules).forEach(name => {
    const module = modules[ name ];
    if (!module.socket) return;
    const { events, actions } = module.socket;
    delete module.socket;
    Object.keys(events).forEach(event => {
      let action = events[ event ];
      if (!Array.isArray(action)) action = [ action ];
      action = action.map(action => convert(action, event, name));
      on(prefix(event, name).split('/'), payload => action.map(action => store.dispatch(action, payload)));
    });
    Object.keys(actions).forEach(action => {
      const [ nsp, event ] = convert(actions[ action ], action, name).split('/');
      actionsMap[ prefix(action, name) ] = { socket: space(nsp), event }
    });
  });
  store.subscribeAction(
    ({ type, payload }) => actionsMap[ type ] && actionsMap[ type ].socket.emit(actionsMap[ type ].event, payload));
}

