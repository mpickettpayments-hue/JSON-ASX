<p align="center">
  <img src="assets/icons/icon.png" width="128" />
</p>

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
```

## Install (local)
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

## Icon Files (Base64 available)
This package includes base64 representations:
- assets/icons/icon.png.b64
- assets/icons/icon-256.png.b64
- assets/icons/icon-128.png.b64
- assets/icons/icon-dark.png.b64
- assets/icons/icon-light.png.b64

Decode on macOS/Linux:
```bash
base64 -d assets/icons/icon.png.b64 > assets/icons/icon.png
```

Windows PowerShell:
```powershell
[IO.File]::WriteAllBytes("assets/icons/icon.png",[Convert]::FromBase64String((Get-Content "assets/icons/icon.png.b64")))
```