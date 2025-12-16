#!/bin/sh

rg -U '#.*[^\n.]\n\s*[^#\s]' -g '{.dockerignore,.editorconfig,.gitattributes,.gitignore,*.toml}' | tee hashtag_simple.tmp
rg -PU '#(?! noqa:).*[^\n.]\n\s*([^#\s])' -g '*.py' | tee hashtag_python.tmp
rg -U '\/\/.*[^\n.]\n\s*([^\/\s])' -g '*.{json,jsonc}' | tee slash_single.tmp
rg -U '\/\/.*[^\n./]\n\s*([^\/\s])' -g '*.js' | tee slash_check.tmp
rg -PU '\/\*[\S\s]*?[^\n.,;}\s](?=\s*\*\/\s)' -g '*.{css,js}' | tee slash_asterisk.tmp

RESULT="$(cat hashtag_simple.tmp)$(cat hashtag_python.tmp)$(cat slash_single.tmp)$(cat slash_check.tmp)$(cat slash_asterisk.tmp)"

if [ -z "$RESULT" ]
then
    echo 'SUCCESS - All comments are valid!'
    exit 0
else
    echo 'ERROR - There are invalid comments!'
    exit 1
fi
