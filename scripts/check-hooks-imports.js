#!/usr/bin/env node

/**
 * React Hooks Import Checker
 * Verifies all React hooks are properly imported
 */

const fs = require('fs');
const path = require('path');

const HOOKS = [
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
  'useContext', 'useReducer', 'useLayoutEffect', 'useImperativeHandle',
  'useDebugValue', 'useId', 'useTransition', 'useDeferredValue',
  'useSyncExternalStore', 'useInsertionEffect'
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const errors = [];
  const warnings = [];
  
  // Get import statement
  const importMatch = content.match(/import\s+(?:React,\s*)?{([^}]+)}\s+from\s+['"]react['"]/);
  const importedHooks = importMatch 
    ? importMatch[1].split(',').map(h => h.trim()).filter(h => HOOKS.includes(h))
    : [];
  
  // Check for each hook usage
  HOOKS.forEach(hook => {
    const hookRegex = new RegExp(`\\b${hook}\\s*\\(`, 'g');
    const matches = content.match(hookRegex);
    
    if (matches && matches.length > 0) {
      if (!importedHooks.includes(hook)) {
        errors.push({
          file: filePath,
          hook,
          line: getLineNumber(content, hook),
          severity: 'error',
          message: `${hook} is used but not imported`
        });
      }
    }
  });
  
  // Check for unused imports
  importedHooks.forEach(hook => {
    const hookRegex = new RegExp(`\\b${hook}\\s*\\(`, 'g');
    if (!hookRegex.test(content)) {
      warnings.push({
        file: filePath,
        hook,
        severity: 'warning',
        message: `${hook} is imported but never used`
      });
    }
  });
  
  return { errors, warnings };
}

function getLineNumber(content, searchTerm) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchTerm)) {
      return i + 1;
    }
  }
  return 0;
}

function scanDirectory(dir) {
  const results = {
    filesScanned: 0,
    errors: [],
    warnings: []
  };
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, dist, build
        if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
          scan(fullPath);
        }
      } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
        results.filesScanned++;
        const { errors, warnings } = checkFile(fullPath);
        results.errors.push(...errors);
        results.warnings.push(...warnings);
      }
    }
  }
  
  scan(dir);
  return results;
}

function printResults(results) {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 React Hooks Import Checker');
  console.log('='.repeat(70));
  console.log(`📁 Files scanned: ${results.filesScanned}`);
  
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('✅ No issues found! All hooks are properly imported.');
  } else {
    if (results.errors.length > 0) {
      console.log(`\n❌ Errors: ${results.errors.length}`);
      results.errors.forEach(err => {
        console.log(`\n  File: ${path.relative(process.cwd(), err.file)}`);
        console.log(`  Line: ${err.line || 'unknown'}`);
        console.log(`  Hook: ${err.hook}`);
        console.log(`  Issue: ${err.message}`);
      });
    }
    
    if (results.warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
      results.warnings.forEach(warn => {
        console.log(`\n  File: ${path.relative(process.cwd(), warn.file)}`);
        console.log(`  Hook: ${warn.hook}`);
        console.log(`  Issue: ${warn.message}`);
      });
    }
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  return results.errors.length === 0;
}

// Main execution
const targetDir = process.argv[2] || path.join(process.cwd(), 'frontend', 'src');

if (!fs.existsSync(targetDir)) {
  console.error(`❌ Directory not found: ${targetDir}`);
  process.exit(1);
}

console.log(`\n🔎 Scanning: ${targetDir}\n`);

const results = scanDirectory(targetDir);
const success = printResults(results);

process.exit(success ? 0 : 1);
