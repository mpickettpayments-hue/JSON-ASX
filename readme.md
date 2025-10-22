# ASX (Advanced Scripting Language) – VSCode Extension Package

This project adds full **VSCode Marketplace** support for the **ASX (Advanced Scripting Language)** used within the **XJSON.APP** ecosystem.

---

## 1) Extension Manifest (`package.json`)

```json
{
  "name": "json-asx-language-support",
  "displayName": "ASX Script Highlighting",
  "description": "Syntax highlighting and language support for ASX (Advanced Scripting Language) – the scripting layer for XJSON.APP.",
  "version": "0.1.0",
  "publisher": "json-asx",
  "license": "MIT",
  "engines": { "vscode": "^1.50.0" },
  "categories": ["Programming Languages"],
  "contributes": {
    "languages": [
      {
        "id": "asx",
        "aliases": ["ASX", "asx"],
        "extensions": [".asx"],
        "configuration": "./syntaxes/asx.language-configuration.json"
      }
    ],
    "grammars": [
      {
        "language": "asx",
        "scopeName": "source.asx",
        "path": "./grammars/asx.tmLanguage.json"
      }
    ],
    "snippets": [
      {
        "language": "asx",
        "path": "./snippets/asx.json"
      }
    ]
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/json-asx-language-support"
  },
  "icon": "icon.png"
}
```

---

## 2) Snippets (`snippets/asx.json`)

```json
{
  "onTick handler": {
    "prefix": "ontick",
    "body": [
      "onTick(() => {",
      "  // update logic",
      "  render(state);",
      "});"
    ],
    "description": "Create an ASX onTick loop"
  },
  "onInput handler": {
    "prefix": "oninput",
    "body": [
      "onInput(\"${1:event}\", (${2:params}) => {",
      "  // handle input",
      "});"
    ],
    "description": "Create an ASX onInput event handler"
  },
  "render function": {
    "prefix": "render",
    "body": [
      "function render(state) {",
      "  const vdom = asx.vdom.h(\"div\", { id: \"game-container\" }, []);",
      "  asx.vdom.patch(vdom);",
      "}"
    ],
    "description": "Basic ASX render function"
  }
}
```

---

## 3) README for Marketplace

````md
# ASX Script Highlighting

Syntax highlighting and editor support for the **ASX (Advanced Scripting Language)**, part of the **XJSON.APP** ecosystem.

## Features
- Syntax highlighting for `.asx` files
- Support for event functions (`onTick`, `onInput`, etc.)
- Snippets for rapid development
- JS-like style for familiarity

## Example
```asx
onTick(() => {
  state.player.x += 1;
  render(state);
});

onInput("shoot", () => {
  state.projectiles.push({ x: state.player.x, y: state.player.y });
});
````

## Installation

```bash
npm install -g @vscode/vsce
vsce package
code --install-extension json-asx-language-support-0.1.0.vsix
```

## Publish

```bash
vsce login json-asx
vsce publish
```

---

**ASX (Advanced Scripting Language)** bridges declarative game logic and AI-driven data, empowering developers to build dynamic experiences directly in the browser.
