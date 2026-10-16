# Puts node and msgfmt in the PATH of a git hook. Sourced by the hooks from the
# repository (installed in .git/hooks they have no files next to them).
# A graphical git client (GitHub Desktop, VS Code, Sourcetree) does not load
# the user's shell profile, so nvm and Homebrew are not in its PATH. When node
# cannot be found the hook fails: a commit is never let through unchecked.

hook_node_nvm() {
    local nvm_sh=$1
    [[ -s "$nvm_sh" ]] || return 1
    # Without NVM_DIR, nvm.sh finds itself with NVM_CD_FLAGS, which a zsh
    # parent exports as -q and bash's cd rejects
    export NVM_DIR="${nvm_sh%/nvm.sh}"
    # nvm.sh switches to the default alias while it loads
    . "$nvm_sh" </dev/null >/dev/null 2>&1 || true
    if [[ -f .nvmrc ]] && command -v nvm >/dev/null 2>&1; then
        nvm use --silent </dev/null >/dev/null 2>&1 || true
    fi
    command -v node >/dev/null 2>&1
}

hook_node_dir() {
    [[ -x "$1/node" ]] || return 1
    export PATH="$1:$PATH"
}

if ! command -v node >/dev/null 2>&1; then
    { [[ -n "$NVM_DIR" ]] && hook_node_nvm "$NVM_DIR/nvm.sh"; } ||
        hook_node_nvm "$HOME/.nvm/nvm.sh" ||
        hook_node_dir /opt/homebrew/bin ||
        hook_node_dir /usr/local/bin ||
        hook_node_dir "$HOME/.volta/bin" ||
        hook_node_dir "$HOME/.fnm/aliases/default/bin" ||
        hook_node_dir "$HOME/.local/share/fnm/aliases/default/bin" ||
        {
            echo "⛔ node not found: run git from a shell where node works, or install Node.js from .nvmrc" >&2
            exit 1
        }
fi

# The data check needs msgfmt too, and Homebrew's is missing from that PATH
# just the same. Without it the check fails and prints how to install gettext.
if ! command -v msgfmt >/dev/null 2>&1; then
    for dir in /opt/homebrew/bin /usr/local/bin /opt/homebrew/opt/gettext/bin \
        /usr/local/opt/gettext/bin; do
        if [[ -x "$dir/msgfmt" ]]; then
            export PATH="$PATH:$dir"
            break
        fi
    done
fi
