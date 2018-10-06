# vuex-socket-sync [![Coverage Status](https://coveralls.io/repos/github/yarsky-tgz/vuex-socket-sync/badge.svg?branch=master)](https://coveralls.io/github/yarsky-tgz/vuex-socket-sync?branch=master) [![Build Status](https://travis-ci.org/yarsky-tgz/vuex-socket-sync.svg?branch=master)](https://travis-ci.org/yarsky-tgz/vuex-socket-sync)

Vuex plugin, which makes simple, but very powerful job: 
 * on each `action` dispatch it emits socket `event`, specified for that `action`, **with same payload**
 * on each received socket `event` it dispatches one or more `actions`, specified for such event, **with same payload**
 
## Installation
 
```bash
npm i vuex-socket-sync
```

## Usage

It works only with vuex modules. 

Into each module describing object u can add optional property `socket`, which should consists from two sub properties: `events` and `actions`. 

`events` should be object representing event-to-action mapping and `actions` should represent action-to-event mapping

Simplest example: 

```javascript
{
  events: {
    answer: 'setAnswer'
  },
  actions: {
    ask: 'question'
  }
}
```

No problem if you want few modules actions to be dispatched by one event:

```javascript
events: {
  answer: [
    'setAnswer',
    'logger/logAnswer'
  ] 
}
```

In case we haven't slash `'/'` in `event` or `action` mapping value it shall be namespaced or prefixed with current `module` name. 

Be patient: that is actual only for **right part** of mapping. **left part** always belongs to current module and **same named** namespace. So you can write: 

```
  event: 'otherModule/action'
```

but you cannot 

```
  'otherModule/event': 'myAction'
```

In case we have `'='` as mapping value it means, that   we shall use same name for `event` or `action`

## Full Store Example

```javascript
import socket from 'vuex-socket-sync';
import io from 'socket.io-client/dist/socket.io.slim';

const modules = {
  folders: {
    namespaced: true,
    state: {
      choosenFolder: null,
      path: '',
      tree: [],
      paths: []
    },
    actions,
    mutations,
    socket: {
      events: {
        paths: [
          'fillQueryPaths',
          'settings/saveActualPaths'
        ]
      },
      actions: {
        openUserFolder: 'browse',
        execute: 'interpreter/execute',
        search: '='
      }
    }
  }
};
const state = {};

export default new Vuex.Store({
  strict: 'true',
  state,
  modules,
  plugins: [
    socket(io, modules)
  ]
});
```

So, what we have here?

On socket event from namespace `/folders` with name `paths` shall be dispatched actions `folders/fillQueryPaths` and `settings/saveActualPaths`.
On dispatch action `folders/openUserFolder` shall be emitted event `browse` of namespace `/folders`.
On dispatch action `folders/execute` shall be emitted event `execute` of namespace `/interpreter`. 
On dispatch action `folders/search` shall be emitted event `search` of namespace `/folders`

As you see you just give socket.io client builder to plugin. It takes care about everything else by it's own 