# JSDOC Namespace Resolver

This is a pretty minimal plugin that handles one purpose, automatically resolving types specified in params, exceptions, and returns if they are in the same namespace as the current function (denoted by memberof tags).

I found that vscode and webstorm have no issue resolving the type without the added namespace (e.g. bar.foo resolves the same as foo) if you want to exclude the namespace, this plugin will check if the type exists in the relative namespace and resolve the name on build to allow for linking to still work properly. This currently works specifically for namespace as that is what I needed it for and see no purpose in adding further unless anyone else needs it.

## Usage (NPM)

To enable simply install with:
```bash
npm install --save-dev jsdoc-namespace-resolver
```

and add to your plugins in your jsdoc config

```json
{
  "plugins": [
    "node_modules/jsdoc-namespace-resolver/index.js"
  ]
}
```
