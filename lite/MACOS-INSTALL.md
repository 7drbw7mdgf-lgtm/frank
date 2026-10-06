# Install Frank Lite 1.0.0 on macOS

Download [Frank-Lite-1.0.0.dmg](https://github.com/7drbw7mdgf-lgtm/frank/releases/download/lite-v1.0.0/Frank-Lite-1.0.0.dmg) and `Frank-Lite-1.0.0-SHA256SUMS.txt` from the [official release](https://github.com/7drbw7mdgf-lgtm/frank/releases/tag/lite-v1.0.0). Requires macOS 11 or later. The app includes native executables for both Apple Silicon and Intel Macs.

## Verify and install

Save the DMG and checksum file in the same directory. In Terminal:

```sh
cd ~/Downloads
shasum -a 256 -c Frank-Lite-1.0.0-SHA256SUMS.txt
```

Continue if the result is `Frank-Lite-1.0.0.dmg: OK`. Open the DMG and drag `Frank Lite.app` into Applications. Quit an older installed copy before replacing it. Launch the installed copy rather than running it from the mounted disk image.

## First launch

This build is ad hoc signed and has not been notarized by Apple. If macOS blocks the app as an unidentified developer, try opening it once, then use **System Settings → Privacy & Security → Open Anyway**. Apple describes this in [Safely open apps on your Mac](https://support.apple.com/en-us/102445).

The DMG and release also include `Allow-Frank-Lite.command`. This helper verifies the app name, bundle ID `com.gemini.frank5.lite`, version `1.0.0`, and bundle signature before removing only its quarantine flag. It does not notarize the app or change Gatekeeper or SIP globally. An ad hoc signature verifies bundle integrity, not the publisher's identity.

```sh
# Verify only; change nothing.
bash ~/Downloads/Allow-Frank-Lite.command --check "/Applications/Frank Lite.app"

# Verify again, then request your explicit approval.
bash ~/Downloads/Allow-Frank-Lite.command "/Applications/Frank Lite.app"
```

Type `yes` only if you trust this download. The helper also supports a personal installation such as `"$HOME/Applications/Frank Lite.app"`. It rejects other versions, other app identities, symlink app targets, and root execution. It never re-signs the app or clears unrelated extended attributes. If Finder will not run the downloaded `.command` file, use the explicit `bash` command shown above. If permissions prevent the change, use Open Anyway or install in your personal Applications folder.

A checksum or signature mismatch requires a fresh download. Do not use this helper to override a malware warning. Managed Macs may restrict local exceptions.

## Workspaces and pages

Frank Lite has a hard limit of **one space and three saved pages**. These are workspace documents, not three printed sheets; each document may contain multiple physical pages. The limit includes imports, duplicates, templates, daily notes, and newly created linked pages. Existing pages remain editable at the limit. Close or delete a saved page to free a slot, exporting its contents first if needed. Deleting the final page leaves one blank replacement page.

Lite has its own app identity and `frank-lite:` storage keys, so it does not inherit or overwrite the Full workspace. Automatic folder sync starts disabled. Choose a separate sync folder if you enable it. Oversized saved Lite data is preserved; download its backup before explicitly starting a new workspace. Individual `.fm`, Markdown, code and DOCX documents can be opened while a page slot is available.

## Native integration updates

Both editions preserve current edits and restore the saved active page at startup. The native launcher respects the selected sync folder and keeps background saves from changing the active page’s file path. Native DOCX opening, macOS confirmation and rename dialogs, local HTML publishing, and the interactive Screenshot action are connected. Local Publish creates an HTML file on this Mac; Download HTML produces a file you can send or host. Screenshot uses macOS’s interactive capture tool and may need OS permissions.

## Distribution and source archives

This public repository is for installers and installation support. Editable application source, tests, and build files are maintained locally and are not published as repository files. GitHub automatically adds ZIP and tar.gz archives of the repository to release pages; those links cannot be hidden. They contain this distribution repository rather than a separate source checkout. Use the direct DMG link above to install.

The app itself includes JavaScript and other resources needed to run. Distributing an app does not make those bundled resources inaccessible or prevent inspection. There is no claim that GitHub or the installer encrypts or makes the app's implementation confidential.
