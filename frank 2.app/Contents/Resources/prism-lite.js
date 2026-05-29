(function () {
  const escape = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const rules = [
    [/(&quot;.*?&quot;|&#039;.*?&#039;|`[\s\S]*?`)/g, 'string'],
    [/\b(function|const|let|var|return|if|else|for|while|try|catch|throw|async|await|def|class|import|from|SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|INNER|JOIN|struct|int|std|echo|mkdir|tar|library|require|repeat|break|next|in)\b/g, 'keyword'],
    [/\b(true|false|null|None|True|False|TRUE|FALSE|NULL|NA|NA_integer_|NA_real_|NA_complex_|NA_character_|Inf|NaN)\b/g, 'boolean'],
    [/\b\d+(?:\.\d+)?(?:L|e[+-]?\d+)?\b/g, 'number'],
    [/([A-Za-z_][\w.]*)\s*(?=\()/g, 'function'],
    [/(#.*$|\/\/.*$|\/\*[\s\S]*?\*\/|--.*$)/gm, 'comment']
  ];

  function highlight(code) {
    let highlighted = escape(code);
    rules.forEach(([pattern, token]) => {
      highlighted = highlighted.replace(pattern, '<span class="token ' + token + '">$1</span>');
    });
    return highlighted;
  }

  window.Prism = {
    highlightElement(element) {
      if (!element) return;
      element.innerHTML = highlight(element.textContent || '');
    }
  };
})();
