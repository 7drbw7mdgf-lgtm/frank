# Install Frank 5.5.1 on macOS

Download [Frank-5.5.1.dmg](https://github.com/7drbw7mdgf-lgtm/frank/releases/download/v5.5.1/Frank-5.5.1.dmg) and `Frank-5.5.1-SHA256SUMS.txt` from the [official release](https://github.com/7drbw7mdgf-lgtm/frank/releases/tag/v5.5.1). Requires macOS 11 or later. The app includes native executables for both Apple Silicon and Intel Macs.

## Verify and install

Save the DMG and checksum file in the same directory. In Terminal:

```sh
cd ~/Downloads
shasum -a 256 -c Frank-5.5.1-SHA256SUMS.txt
```

Continue if the result is `Frank-5.5.1.dmg: OK`. Open the DMG and drag `Frank.app` into Applications. Quit an older installed copy before replacing it. Launch the installed copy rather than running it from the mounted disk image.

## First launch

This build is ad hoc signed and has not been notarized by Apple. If macOS blocks the app as an unidentified developer, try opening it once, then use **System Settings → Privacy & Security → Open Anyway**. Apple describes this in [Safely open apps on your Mac](https://support.apple.com/en-us/102445).

The DMG and release also include `Allow-Frank.command`. This helper verifies the app name, bundle ID `com.gemini.frank5`, version `5.5.1`, and bundle signature before removing only its quarantine flag. It does not notarize the app or change Gatekeeper or SIP globally. An ad hoc signature verifies bundle integrity, not the publisher's identity.

```sh
# Verify only; change nothing.
bash ~/Downloads/Allow-Frank.command --check "/Applications/Frank.app"

# Verify again, then request your explicit approval.
bash ~/Downloads/Allow-Frank.command "/Applications/Frank.app"
```

Type `yes` only if you trust this download. The helper also supports a personal installation such as `"$HOME/Applications/Frank.app"`. It rejects other versions, other app identities, symlink app targets, and root execution. It never re-signs the app or clears unrelated extended attributes. If Finder will not run the downloaded `.command` file, use the explicit `bash` command shown above. If permissions prevent the change, use Open Anyway or install in your personal Applications folder.

A checksum or signature mismatch requires a fresh download. Do not use this helper to override a malware warning. Managed Macs may restrict local exceptions.

## Workspaces and pages

The Full edition keeps the supplied Frank 5.5 feature set without a space or page cap. This update restores the active saved page at launch and preserves current edits before creating or duplicating pages and spaces. Opening `.fm` documents uses a new page, preserving the current document. Browser workspace data is local to the app; export important documents before changing installations or storage.

## Native integration updates

Both editions preserve current edits and restore the saved active page at startup. The native launcher respects the selected sync folder and keeps background saves from changing the active page’s file path. Native DOCX opening, macOS confirmation and rename dialogs, local HTML publishing, and the interactive Screenshot action are connected. Local Publish creates an HTML file on this Mac; Download HTML produces a file you can send or host. Screenshot uses macOS’s interactive capture tool and may need OS permissions.

## Distribution and source archives

This public repository is for installers and installation support. Editable application source, tests, and build files are maintained locally and are not published as repository files. GitHub automatically adds ZIP and tar.gz archives of the repository to release pages; those links cannot be hidden. They contain this distribution repository rather than a separate source checkout. Use the direct DMG link above to install.

The app itself includes JavaScript and other resources needed to run. Distributing an app does not make those bundled resources inaccessible or prevent inspection. There is no claim that GitHub or the installer encrypts or makes the app's implementation confidential.
