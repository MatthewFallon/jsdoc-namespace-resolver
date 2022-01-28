const logger = require("jsdoc/util/logger")

module.exports.handlers = {
  processingComplete: function (e) { // Handles resolving after all other symbols are imported/resolved
    /**
     * Used to store lists of all members names for all members in defined namespaces.
     * @type {Object}
     */
    let memberMap = {}

    /**
     * Used to store lists of each function in defined namespaces.
     * @type {Object}
     */
    let memberFuncMap = {}

    // Will filter and build both maps from all doclets.
    e.doclets.forEach(doclet => {
      if (!doclet.undocumented && doclet.scope === 'static' && doclet.memberof && doclet.memberof !== "module" ) {
        if (memberMap[doclet.memberof]) {
          memberMap[doclet.memberof].push(doclet.name);
        } else {
          memberMap[doclet.memberof] = [doclet.name]
        }
        if (doclet.kind === "function") {
          if (memberFuncMap[doclet.memberof]) {
            memberFuncMap[doclet.memberof].push(doclet)
          } else {
            memberFuncMap[doclet.memberof] = [doclet]
          }
        }
      }
    })

    // Working with each function in the func map to resolve its types.
    for (const namespace in memberFuncMap) {
      for (const memberFunc of memberFuncMap[namespace]) {
        if (memberFunc.params) {
          for (const param of memberFunc.params) {
            if (memberMap[namespace].includes(param.type.names[0])) { //referencing member map for corresponding types.
              param.type.names[0] = namespace + "." + param.type.names[0]
            }
          }
        }
        if (memberFunc.exceptions) {
          for (const exception of memberFunc.exceptions) {
            if (memberMap[namespace].includes(exception.type.names[0])) {
              exception.type.names[0] = namespace + "." + exception.type.names[0]
            }
          }
        }
        if (memberFunc.returns) {
          for (const funcReturn of memberFunc.returns) {
            if (memberMap[namespace].includes(funcReturn.type.names[0])) {
              funcReturn.type.names[0] = namespace + "." + funcReturn.type.names[0]
            }
          }
        }
      }
    }
  }
}
