# vuex-socket-sync [![Coverage Status](https://coveralls.io/repos/github/yarsky-tgz/vuex-socket-sync/badge.svg?branch=master)](https://coveralls.io/github/yarsky-tgz/vuex-socket-sync?branch=master) [![Build Status](https://travis-ci.org/yarsky-tgz/vuex-socket-sync.svg?branch=master)](https://travis-ci.org/yarsky-tgz/vuex-socket-sync)

Plugin to [vuex](https//github.com/vuexjs/vuex), that does a simple, but very powerful job: 
 
 * on every **action** dispatch it emits socket **event**, defined by you for this **action**, with the same data.
 * on every received socket **event**, it dispatches one or more **actions**, defined by you, for such **events**, with the same data.

For organizing of logic on the server side into the modules with the same names you will need to use my library [socket.io-
namespace-controller](https://www.npmjs.com/package/socket.io-namespace-controller)
 
## Installation
 
```bash
npm i vuex-socket-sync socket.io-namespace-controller
```

## Usage

Now you can additionally define in your vuex modules the `socket` property - an object, that defines what **actions** to dispatch in response to what **events** and vice versa - what **event** to emit when dispatching what **actions**.

The object consists of two properties:
 
 * `actions` - an object, that defines what **events** to emit when dispatching **actions**, the names of properties describe the names of **events**, and values - the names of **actions**.  
 * `events` - an object, that defines what **actions** to dispatch after receiving what **events**, the names of properties describe the names of **actions**, and values - the names of **actions**. Value can be an array, then several **actions** will be called.

The module example:

```javascript
{
  namespaced: true,
  getters: {...},
  mutations: {...}
  actions: {
    setAnswer() {...},
    sendQuestion() {...}
  },
  socket: {
    events: {
      answer: 'setAnswer'
    },
    actions: {
     sendQuestion: 'ask'
    }
  }
}
```

In this example we have two **actions** in the module: `setAnswer()` and `sendQuestion()`. And in `socket` property next rules of synchronization of actions with events are defined:

 * on receiving **event** `answer` **action** `setAnswer` will be dispatched with the same data.
 * on dispatching **action** `sendQuestion` **event** `ask` will be emited with the same data.

No problems if you want a few **actions** to be dispatched with one **event**:

```javascript
events: {
  answer: [
    'setAnswer',
    'logger/logAnswer'
  ] 
}
```

You can point the way to the event or action from another namespace (for example `logger/logAnswer`), but it works only for **property values** in `actions`/`events` objects. **Actions** or **events**, that are **properties names** always belong to the current module or 
 socket.io namespace. So you can write:

```
  event: 'otherModule/action'
```

But you cannot

```
  'otherModule/event': 'myAction'
```

If `'='` is set by the **value** of property, it means that the name of **event** and **action**, described with this pair, are the same.

## Example of full vuex store

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

So, what have we got here?

Two actions will be dispatched on event `paths` from the namespace `/folders`: `folders/fillQueryPaths` and `settings/saveActualPaths`.

On dispatching `folders/openUserfolder` event `browse` will be emited from the namespace `/folders`.

On dispatching `folders/execute` event `execute` will be emited from the namespace `/interpreter`.

On dispatching `folders/search` event `search` will be emited from the namespace `/folders`. 

Как Вы видите, вы просто передаёте в плагин конструктор socket.io подключения. Дальше он сам обо всём позаботится.

As you can see, you just transmit socket.io connection constructor to plugin. Later it will care about everything itself.

