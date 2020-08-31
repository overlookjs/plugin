[![NPM version](https://img.shields.io/npm/v/@overlook/plugin.svg)](https://www.npmjs.com/package/@overlook/plugin)
[![Build Status](https://img.shields.io/travis/overlookjs/plugin/master.svg)](http://travis-ci.org/overlookjs/plugin)
[![Dependency Status](https://img.shields.io/david/overlookjs/plugin.svg)](https://david-dm.org/overlookjs/plugin)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookjs/plugin.svg)](https://david-dm.org/overlookjs/plugin)
[![Greenkeeper badge](https://badges.greenkeeper.io/overlookjs/plugin.svg)](https://greenkeeper.io/)
[![Coverage Status](https://img.shields.io/coveralls/overlookjs/plugin/master.svg)](https://coveralls.io/r/overlookjs/plugin)

# Overlook framework Plugin class

Part of the [Overlook framework](https://overlookjs.github.io/).

## Introduction

[Overlook framework](https://overlookjs.github.io/) `Plugin` class. Plugins should be created with this class.

Overlook is intended to be extremely modular and flexible.

The base `Route` class has very little functionality, and most functionality is intended to be added using plugins.

Plugins apply per route, not at application level.

One route, or subtree of routes, can have one behavior, another subtree can have another. So, for example, one part of the app can use [React](https://reactjs.org/), another part can server-render pages from [EJS](https://ejs.co/) templates.

This architecture allows:

1. "Snap in" plugins providing common functionality, making building apps fast
2. Granular control over every route's individual behavior

## Usage

### Creating a plugin

A plugin is created from a function which receives a `Route` class and should return a subclass of it.

```js
const Plugin = require('@overlook/plugin'),
  makeSymbols = require('@overlook/util-make-symbols'),
  { INIT_PROPS, INIT_ROUTE } = require('@overlook/route');

const { TYPE, GREETING } = makeSymbols(
  [ 'TYPE', 'GREETING' ]
);

const mammalPlugin = new Plugin( Route => (
  class extends Route {
    [INIT_PROPS]( props ) {
      super[INIT_PROPS]( props );
      this[TYPE] = undefined;
    }

    [INIT_ROUTE]( app ) {
      super[INIT_ROUTE]( app );
      if (this[TYPE] === undefined) this[TYPE] = 'mammal';
    }

    [GREETING]() {
      return `Hello, I am a ${this[TYPE]}.`;
    }
  }
) );

mammalPlugin.TYPE = TYPE;
mammalPlugin.GREETING = GREETING;
```

New methods and properties should have Symbol keys, not strings. If properties are intended to be accessed by other plugins, or methods intended to be available for extending, the Symbol should be exported as a property of the `Plugin` object.

The plugin can than be used create a subclass of a `Route` class, using `.extend()`:

```js
const Route = require('@overlook/route');

const MammalRoute = Route.extend( mammalPlugin );
```

That subclass can now be used to create a route which includes the plugin's functionality:

```js
const route = new MammalRoute();

route[ mammalPlugin.GREETING ]()
// => 'Hello, I am a mammal.'
```

### Removing Symbols boilerplate

It's typical for a plugin to define Symbols.

To reduce boilerplate code, you can create Symbols within the `Plugin` constructor. The plugin is passed to `extend()` as 2nd arg, so you can access the symbols from there.

This example is equivalent to the first:

```js
const Plugin = require('@overlook/plugin'),
  { INIT_PROPS, INIT_ROUTE } = require('@overlook/route');

const mammalPlugin = new Plugin(
  { symbols: [ 'TYPE', 'GREETING' ] },
  ( Route, { TYPE, GREETING } ) => class extends Route {
    [INIT_PROPS]( props ) {
      super[INIT_PROPS]( props );
      this[TYPE] = undefined;
    }

    [INIT_ROUTE]( app ) {
      super[INIT_ROUTE]( app );
      if (this[TYPE] === undefined) this[TYPE] = 'mammal';
    }

    [GREETING]() {
      return `Hello, I am a ${this[TYPE]}.`;
    }
  }
);
```

The symbols are also automatically set as properties of `mammalPlugin`.

### Publishing a plugin to NPM

`new Plugin()` has a few more options which should be used when publishing a plugin to NPM.

1. You should provide the name and version of the module.
2. Symbols *must* be created using either `@overlook/util-make-symbols` or the `Plugin` constructor.

```js
// Published as `@me/monkey`
// version 1.0.0
const Plugin = require('@overlook/plugin');

const monkeyPlugin = new Plugin(
  {
    name: '@me/monkey',
    version: '1.0.0',
    symbols: [ 'GREETING' ]
  },
  Route => class extends Route { /* ... */ }
);

module.exports = monkeyPlugin;
```

The options object has the same properties as `package.json` so, to avoid having to update the version property every time you publish a new version of the module, you can pass that instead.

```js
const pkg = require('./package.json');

const monkeyPlugin = new Plugin(
  pkg,
  { symbols: [ 'GREETING' ] },
  Route => class extends Route { /* ... */ }
);
```

#### Longer example including using symbols

```js
const Plugin = require('@overlook/plugin');
const pkg = require('./package.json');

const monkeyPlugin = new Plugin(
  pkg,
  { symbols: [ 'GREETING' ] },
  ( Route, { GREETING } ) => class extends Route {
    [GREETING]() {
      return 'Hello, I am a monkey.';
    }
  }
);
```

### Composing plugins

Plugins can extend other plugins.

Let's say we have various routes which need a "greeting" method. This functionality can be split off into its own plugin.

```js
const Plugin = require('@overlook/plugin'),
  { INIT_PROPS, INIT_ROUTE } = require('@overlook/route');

const greetingPlugin = new Plugin(
  { symbols: [ 'TYPE', 'GET_TYPE', 'GREETING' ] },
  ( Route, { TYPE, GET_TYPE, GREETING } ) => class extends Route {
    [INIT_PROPS]( props ) {
      super[INIT_PROPS]( props );
      this[TYPE] = undefined;
    }

    [INIT_ROUTE]( app ) {
      super[INIT_ROUTE]( app );
      this[TYPE] = this[GET_TYPE]();
    }

    [GET_TYPE]() {
      return 'mystery';
    }

    [GREETING]() {
      return `Hello, I am a ${this[TYPE]}.`;
    }
  }
} );
```

Now other plugins can extend off that:

```js
const monkeyPlugin = new Plugin( {
  extends: [ greetingPlugin ],
  extend: ( Route, { GET_TYPE } ) => class extends Route {
    [GET_TYPE]() {
      return 'monkey';
    }
  }
} );

const zebraPlugin = new Plugin( {
  extends: [ greetingPlugin ],
  extend: ( Route, { GET_TYPE } ) => class extends Route {
    [GET_TYPE]() {
      return 'zebra';
    }
  }
} );

const MonkeyRoute = Route.extend( monkeyPlugin );
const monkey = new MonkeyRoute();
monkey[GREETNG]()
// => 'Hello, I am a monkey.'

const ZebraRoute = Route.extend( zebraPlugin );
const zebra = new ZebraRoute();
zebra[GREETNG]()
// => 'Hello, I am a zebra.'
```

Plugins automatically inherit the Symbols (and any other properties) of the plugins they extend.

Symbols a plugin defines must therefore not have name clashes with plugins they extend. An error will be thrown if this is the case.

```js
zebraPlugin.GREETING === greetingPlugin.GREETING // => true
```

### `isPlugin()` static method

`isPlugin()` returns `true` if input is a Plugin.

```js
const Plugin = require('@overlook/plugin');
const plugin = new Plugin( () => {} );

Plugin.isPlugin( plugin ) // => true
```

## Versioning

This module follows [semver](https://semver.org/). Breaking changes will only be made in major version updates.

All active NodeJS release lines are supported (v10+ at time of writing). After a release line of NodeJS reaches end of life according to [Node's LTS schedule](https://nodejs.org/en/about/releases/), support for that version of Node may be dropped at any time, and this will not be considered a breaking change. Dropping support for a Node version will be made in a minor version update (e.g. 1.2.0 to 1.3.0). If you are using a Node version which is approaching end of life, pin your dependency of this module to patch updates only using tilde (`~`) e.g. `~1.2.3` to avoid breakages.

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/overlookjs/plugin/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookjs/plugin/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add tests for new features
* document new functionality/API additions in README
* do not add an entry to Changelog (Changelog is created when cutting releases)
