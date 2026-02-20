(function () {
  var script = document.currentScript;
  var projectSlug = script.getAttribute("data-project");
  var apiBase = script.src.replace("/embed.js", "");

  if (!projectSlug) {
    console.error("Waitlist embed: missing data-project attribute");
    return;
  }

  // Design token detection
  function extractDesignTokens() {
    var tokens = {
      colors: {},
      typography: {},
      spacing: {},
      borderRadius: {},
      darkMode: false
    };

    // 1. Extract CSS custom properties
    var rootStyles = getComputedStyle(document.documentElement);
    var cssVars = [
      '--primary-color', '--secondary-color', '--accent-color',
      '--background-color', '--surface-color', '--text-color',
      '--font-family', '--font-size-base', '--spacing-sm', '--spacing-md', '--spacing-lg',
      '--border-radius-sm', '--border-radius-md', '--border-radius-lg'
    ];

    cssVars.forEach(function(varName) {
      var value = rootStyles.getPropertyValue(varName).trim();
      if (value) {
        var tokenName = varName.replace('--', '').replace(/-/g, '_');
        setNestedValue(tokens, tokenName, value);
      }
    });

    // 2. Sample computed styles from key elements
    var elements = {
      button: document.querySelector('button, [type="submit"], .btn'),
      heading: document.querySelector('h1, h2, h3'),
      input: document.querySelector('input, textarea'),
      container: document.querySelector('.container, .wrapper, main')
    };

    for (var key in elements) {
      var el = elements[key];
      if (!el) continue;
      
      var styles = getComputedStyle(el);
      
      // Extract colors
      if (!tokens.colors.primary && key === 'button') {
        tokens.colors.primary = rgbToHex(styles.backgroundColor);
      }
      if (!tokens.colors.text && key === 'heading') {
        tokens.colors.text = rgbToHex(styles.color);
      }
      if (!tokens.colors.background && key === 'container') {
        tokens.colors.background = rgbToHex(styles.backgroundColor);
      }
      
      // Extract typography
      if (!tokens.typography.fontFamily && key === 'heading') {
        tokens.typography.fontFamily = styles.fontFamily.split(',')[0].replace(/['"]/g, '');
      }
      if (!tokens.typography.fontSize && key === 'heading') {
        tokens.typography.fontSize = parseInt(styles.fontSize);
      }
      
      // Extract border radius
      if (!tokens.borderRadius.default && key === 'button') {
        tokens.borderRadius.default = parseInt(styles.borderRadius);
      }
    }

    // 3. Detect dark mode
    tokens.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                    document.documentElement.classList.contains('dark') ||
                    document.body.classList.contains('dark');

    // 4. Fallback defaults if nothing detected
    if (Object.keys(tokens.colors).length === 0) {
      tokens.colors = {
        primary: '#3b82f6',
        text: '#1f2937',
        background: '#ffffff'
      };
    }
    if (!tokens.typography.fontFamily) {
      tokens.typography.fontFamily = 'Inter, system-ui, sans-serif';
    }
    if (!tokens.borderRadius.default) {
      tokens.borderRadius.default = 6;
    }

    return tokens;
  }

  function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    var result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return rgb;
    
    var r = parseInt(result[0]);
    var g = parseInt(result[1]);
    var b = parseInt(result[2]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function setNestedValue(obj, path, value) {
    var keys = path.split('_');
    var current = obj;
    
    for (var i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  // Extract design tokens
  var designTokens = extractDesignTokens();
  console.log('w8list detected design tokens:', designTokens);

  var iframe = document.createElement("iframe");
  iframe.src = apiBase + "/waitlist/" + projectSlug + "?embed=true&tokens=" + encodeURIComponent(JSON.stringify(designTokens));
  iframe.style.cssText = "width:100%;border:none;max-width:400px;min-height:360px;";
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "Waitlist Signup");

  script.parentNode.insertBefore(iframe, script.nextSibling);

  // Auto-resize iframe to fit content
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "w8list-resize" && e.data.slug === projectSlug) {
      iframe.style.height = e.data.height + "px";
    }
  });
})();
