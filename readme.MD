## Open Up - An Open Voice Chat
Open Up is a free, privacy-first and open-source voice chat based on the WebRTC standard.

### Download
Download for your OS [here](https://github.com/grimmfl/open-up/releases/latest/download).

Supported OS:

| OS           | Auto Update |
|--------------|-------------|
| Windows      | ✅ Yes      |
| Mac OS       | ❌ No       |
| Debian-based | ❌ No       |
| Rpm-based    | ❌ No       |
| AppImage     | ❌ No       |

### Notes
The app is not signed, because certificates cost at least 70$ per year per OS.

Because of that, you will probably receive a Windows Defender warning on Windows.

On Mac, there will likely be an error as well. You can run the file after executing the command below in a terminal. The path will usually be /Applications/OpenUp.app
```shell
xattr -d com.apple.quarantine /path/to/file
```

### Icons
The icons are taken from [Untitled UI](https://www.untitledui.com/icon/list).

### Build process
- Run npm run licenses
- Set version in package.json and release/package.json
- run ```npm install```
- Push
- Create a tag
```
git tag v0.2.2
git push origin tag v0.2.2
```

### Deleting a tag
```
git tag -d v0.2.2
git push origin :refs/tags/v0.2.2
```
