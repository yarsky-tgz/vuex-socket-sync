# vuex-socket-sync [![Coverage Status](https://coveralls.io/repos/github/yarsky-tgz/vuex-socket-sync/badge.svg?branch=master)](https://coveralls.io/github/yarsky-tgz/vuex-socket-sync?branch=master) [![Build Status](https://travis-ci.org/yarsky-tgz/vuex-socket-sync.svg?branch=master)](https://travis-ci.org/yarsky-tgz/vuex-socket-sync)

Плагин к [vuex](https://github.com/vuejs/vuex), который выполняет простую, но очень эффективную работу:

 * при каждой диспетчеризации **действия** (`action`) он отправляет в сокет **событие** (`event`), назначенное Вами для этого **действия**, с теми же данными.
 * при каждом полученном через сокет **событии** , он диспетчеризует одно или более **действий**, назначенных Вами для таких **событий**, с теми же данными.
 
## Установка
 
```b
npm i vuex-socket-sync
```

## Использование
 
It works only with vuex modules.
 
Это работает только с модулями vuex.

Into each vuex module u can add optional property `socket`, which should consist from two sub properties: `events` and `actions`. 

В каждый модуль можно добавить необязательное свойство `socket`, которое должно состоять из двух суб свойств: событий **events** 
и действий **actions**.
 
`events` should be object representing event-to-action mapping and `actions` should represent action-to-event mapping

События **events** должны быть отображением объектов, представляющих событие - действие и действия **actions** должны отображать 
представление действие-событие.

Simplest example of `socket` mapping: 

Простейший пример отображения сокета **socket**:

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

No problem if you want a few modules actions to be dispatched by one event:


Нет проблем, если Вы хотите, чтобы несколько модулей действий были диспетчеризованы одним событием **event**: 

```javascript
events: {
  answer: [
    'setAnswer',
    'logger/logAnswer'
  ] 
}
```

In case we haven't slash `'/'` in `event` or `action` mapping value it will be namespaced or prefixed with current `module` name. 

В случае, когда у нас нет слэш **slash** "/" в событии **event** или действии **action**, отображающих значение, оно будет заменено или написано через дефис с текущим названием модуля **module**.

Be patient: that is actual only for **right part** of mapping. **left part** always belongs to current module and **same named** namespace. So you can write: 

Потерпите: это актуально только для правой части **right part** отображения. Левая часть **left part** всегда принадлежит к текущему модулю и одноимённа **same named** в пространстве имён. Поэтому Вы можете написать:

```
  event: 'otherModule/action'
```

but you cannot 

Но Вы не можете

```
  'otherModule/event': 'myAction'
```

In case we have `'='` as mapping value it means, that   we shall use the same name for `event` or `action`

В случае, когда мы имеем  =    как отображение значения, это значит, что мы будем использовать то же самое имя для события **event** или действия **action** 

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

Итак, что мы имеем здесь?


On socket event from namespace `/folders` with name `paths` shall be dispatched two actions: `folders/fillQueryPaths` and `settings/saveActualPaths`.

В сокет событие из папок **folders**  пространства имён c именем (пути) **paths** будут диспетчеризованы два действия: (папки/ заполнениеЗапросПути) **folders/fillQueryPaths** и (настройки/сохранитьФактическийПути).

On dispatch action `folders/openUserFolder` will be emitted event `browse` of namespace `/folders`.

При диспетчеризации (папки/открытьПользовательПапка) **folders/openUserFolder** будет выделено событие "просмотр" **browse** папок пространства имён **/folders**.

On dispatch action `folders/execute` will be emitted event `execute` of namespace `/interpreter`. 

При диспетчеризации **оформления папок** (`folders/execute`)  будет отправлено сообщение от переводчика из пространства имён (`/interpreter).

On dispatch action `folders/search` will be emitted event `search` of namespace `/folders`.

При диспетчеризации поиска папок (`folders/search`) будет отправлено событие **поиск** (`search`) папок **`/folders`** в пространстве имён.

As you can see you just give socket.io client builder to plugin. It takes care about everything else by it's own 

Как Вы видите, вы только даёте клиенту соединиться через сокет. Дальше он сам обо всём позаботится.

