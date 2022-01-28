const logger = require("jsdoc/util/logger")

/**
 *
 * @param {string} type
 * @return {{newTypeName: string, isArray: boolean}} The new type name after processing.
 */
function stripArray(type) {
  let newTypeName = type;
  let isArray = false;
  if (type.startsWith("Array.")) {
    newTypeName = type.slice(type.indexOf("<") + 1, type.length - 1);
    isArray = true;
  }

  return {newTypeName, isArray};
}

/**
 *
 * @param {Object} tag - The tag to process types for.
 * @param {Object} [tag.type] - The tag's type if it exists.
 * @param {string[]} tag.type.names - The tags names. always length 1.
 * @param {string[]} memberArray - Array of members in the same namespace.
 * @param {string} namespace - The namespace of the current tag's doclet.
 * @return {Object} The processed tag.
 */
function processTypes(tag, memberArray, namespace) {
  if (tag.type) {
    let {newTypeName, isArray} = stripArray(tag.type.names[0]);
    if (memberArray.includes(newTypeName)) { //referencing member map for corresponding types.
      newTypeName = namespace + "." + newTypeName
    }
    if (isArray) {
      tag.type.names[0] = "Array.<" + newTypeName + ">"
    } else {
      tag.type.names[0] = newTypeName
    }
    return tag
  }
}


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
          for (let param of memberFunc.params) {
            param = processTypes(param,memberMap[namespace], namespace);
          }
        }
        if (memberFunc.exceptions) {
          for (let exception of memberFunc.exceptions) {
            exception = processTypes(exception,memberMap[namespace], namespace);
          }
        }
        if (memberFunc.returns) {
          for (let funcReturn of memberFunc.returns) {
            funcReturn = processTypes(funcReturn,memberMap[namespace], namespace);
          }
        }
      }
    }
  }
}
