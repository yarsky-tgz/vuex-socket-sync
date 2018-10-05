const defaultOptions = {
  root: false,
  usePrefixForSocket: true
};
const prefix = (target, name) => target.indexOf('/') !== -1 ? target : name + '/' + target;
const convert = (target, index, name) => prefix(target === '=' ? index : target, name);
export default (socket, modules, optionsOverride = {}) => store => {
  const fullActionsMap = {};
  const options = Object.assign({}, defaultOptions, optionsOverride);
  //@TODO: implement options usage
  Object.keys(modules).forEach(name => {
    const module = modules[ name ];
    if (!module.socket) return;
    const { events, actions } = module.socket;
    delete module.socket;
    Object.keys(events).forEach(event => {
      let action = events[ event ];
      if (!Array.isArray(action)) action = [ action ];
      action = action.map(action => convert(action, event, name));
      socket.on(prefix(event, name), function (payload) {
        action.map(action => store.dispatch(action, payload));
      });
    });
    Object.keys(actions).forEach(action => fullActionsMap[ prefix(action, name) ] = convert(actions[ action ], action, name));
  });
  store.subscribeAction(action => fullActionsMap[ action.type ] && socket.emit(fullActionsMap[ action.type ], action.payload));
}

