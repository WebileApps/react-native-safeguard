const { withMainActivity } = require('@expo/config-plugins');

/**
 * Formats a Java/Kotlin map entry from a JS object
 */
function formatSecurityConfigMap(configMap, isKotlin = false) {
  const entries = Object.entries(configMap)
    .map(([key, value]) =>
      isKotlin ? `"${key}" to "${value}"` : `"${key}", "${value}"`
    )
    .join(',\n        ');

  return isKotlin
    ? `override var securityConfigMap: Map<String, String> = mapOf(\n        ${entries}\n    )`
    : `@Override\n    public Map<String, String> securityConfigMap = new HashMap<String, String>() {{\n        ${entries};\n    }};`;
}

module.exports = function withSafeguardActivity(
  _config,
  { securityConfigMap = {} } = {}
) {
  return withMainActivity(_config, async (config) => {
    const isKotlin = config.modResults.language === 'kt';

    if (config.modResults.language === 'java') {
      config.modResults.contents = config.modResults.contents.replace(
        /public class MainActivity extends (.+) {/,
        'public class MainActivity extends com.safeguard.SafeguardReactActivity {'
      );
    } else if (isKotlin) {
      config.modResults.contents = config.modResults.contents.replace(
        /class MainActivity : (.+)\(\) \{/,
        'class MainActivity : com.safeguard.SafeguardReactActivity() {'
      );
    }

    // Add securityConfigMap override
    const securityConfigSnippet = formatSecurityConfigMap(
      securityConfigMap,
      isKotlin
    );

    if (isKotlin) {
      // Check if securityConfigMap already exists
      if (
        !config.modResults.contents.includes('override var securityConfigMap')
      ) {
        config.modResults.contents = config.modResults.contents.replace(
          /\{/, // Insert after class opening
          `{\n    ${securityConfigSnippet}\n`
        );
      }
    } else {
      if (
        !config.modResults.contents.includes(
          'public Map<String, String> securityConfigMap'
        )
      ) {
        config.modResults.contents = config.modResults.contents.replace(
          /\{/, // Insert after class opening
          `{\n    ${securityConfigSnippet}\n`
        );
      }
    }

    return config;
  });
};
