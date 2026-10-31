#!/bin/sh
# Downloads one binary and its SHA-256 checksum from the URL below.
# Verifies the checksum, runs the TUI, then deletes the temporary files.
# No sudo, global installation, or changes to your shell configuration.
# Checksums detect corruption; they are downloaded from the same source.
set -eu

# Download only from this repository’s GitHub Releases.
tui_base='https://github.com/eone666/avdeyev.dev/releases/latest/download'
tui_proto='=https'

run_portfolio() {
    case "$(uname -s)" in
        Darwin) tui_os=apple-darwin ;;
        Linux) tui_os=unknown-linux-musl ;;
        *) echo 'Supported systems: Linux and macOS.' >&2; return 1 ;;
    esac
    case "$(uname -m)" in
        arm64|aarch64) tui_arch=aarch64 ;;
        x86_64|amd64) tui_arch=x86_64 ;;
        *) echo 'Supported architectures: x86_64 and ARM64.' >&2; return 1 ;;
    esac
    if ! [ -r /dev/tty ] || ! [ -w /dev/tty ]; then
        echo 'An interactive terminal is required.' >&2; return 1
    fi
    tui_asset="avdeyev-tui-$tui_arch-$tui_os"
    tui_tmp=$(mktemp -d "${TMPDIR:-/tmp}/avdeyev-tui.XXXXXXXX")
    trap 'rm -rf "$tui_tmp"' EXIT
    trap 'exit 130' INT
    trap 'exit 143' HUP TERM
    echo "Downloading $tui_base/$tui_asset" >&2
    curl -fLsS --proto "$tui_proto" --proto-redir "$tui_proto" --tlsv1.2 "$tui_base/$tui_asset" -o "$tui_tmp/$tui_asset"
    curl -fLsS --proto "$tui_proto" --proto-redir "$tui_proto" --tlsv1.2 "$tui_base/checksums.txt" -o "$tui_tmp/checksums.txt"
    tui_expected=$(awk -v asset="$tui_asset" '$2 == asset {print $1}' "$tui_tmp/checksums.txt")
    if [ "${#tui_expected}" -ne 64 ]; then echo 'Missing TUI checksum.' >&2; return 1; fi
    if command -v sha256sum >/dev/null 2>&1; then
        tui_actual=$(sha256sum "$tui_tmp/$tui_asset" | awk '{print $1}')
    elif command -v shasum >/dev/null 2>&1; then
        tui_actual=$(shasum -a 256 "$tui_tmp/$tui_asset" | awk '{print $1}')
    else echo 'sha256sum or shasum is required.' >&2; return 1
    fi
    if [ "$tui_expected" != "$tui_actual" ]; then echo 'TUI checksum mismatch.' >&2; return 1; fi
    chmod 700 "$tui_tmp/$tui_asset"
    # A piped shell reads stdin from curl. The TUI must read the controlling TTY.
    "$tui_tmp/$tui_asset" </dev/tty >/dev/tty 2>/dev/tty
}
# Parse the whole script before running; no command consumes the curl pipe.
run_portfolio
