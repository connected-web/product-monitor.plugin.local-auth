# Product Monitor Local Auth Plugin
Adds name and password authentication to product monitor, and enables the secure pages feature.

## Development

```
npm install
npm test
```

## Exposed methods
### plugin()
Creates a new instance of the plugin.

```js
var plugin = require('product-monitor.plugin.local-auth')();
```

### plugin.apply(app)
Applies the plugin to a product-monitor app.
- Registers `POST` `/auth/login`
- Registers `GET` `/auth/logout`
- Registers `GET` `/docs/login`
- Enables the _secure pages_ feature of `product-monitor`

### plugin.info()
Returns the `name`, `description`, and `keywords` for the plugin:

```js
{
    name: 'product-monitor.plugin.sample',
    description: 'Adds name and password authentication to product monitor, and enables the secure pages feature',
    keywords: [
      'product-monitor',
      'nodejs',
      'plugin',
      'passport',
      'local-auth'
    ]
}
```

### plugin.getConfig()
Returns the config applied to the plugin.

### plugin.setConfig(pluginConfig)
Changes the config applied to the plugin.

## Change Log
### 1.0.4
- Fixed console log messages

### 1.0.3
- Fixed POST url in login form

### 1.0.2
- Collapsed common methods into `product-monitor`
- Added call to `application.enableAuthentication(mode)`

### 1.0.1
- Made login form look neater

### 1.0.0
- Initial release
