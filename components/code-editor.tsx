'use client';

import type { BasicSetupOptions } from '@uiw/react-codemirror';
import { langs } from '@uiw/codemirror-extensions-langs';
import { defaultSettingsGithubLight, githubLightStyle } from '@uiw/codemirror-theme-github';
import createTheme from '@uiw/codemirror-themes';
import ReactCodeMirror from '@uiw/react-codemirror';
import { useCallback } from 'react';

/**
 * The mapping for the supported languages/techologies and editor extensions.
 */
const languagesExtensions = {
  dotnet: [langs.cs()],
};

/**
 * Basic, universal settings for the editor itself.
 */
const editorSettings: BasicSetupOptions = {
  tabSize: 4,
  closeBrackets: true,
  autocompletion: true,
  bracketMatching: true,
  highlightActiveLine: true,
} as const;

const editorTheme = createTheme({
  theme: 'light',
  settings: {
    ...defaultSettingsGithubLight,
    foreground: 'var(--foreground)',
    fontFamily: 'var(--font-mono)',
    background: 'var(--background)',
    gutterBackground: 'var(--accent)',
  },
  styles: [...githubLightStyle],
});

interface CodeEditorProps {
  contents?: string;
  onContentsChange: (value: string) => void;
  language: keyof typeof languagesExtensions;
}

export function CodeEditor({ contents = '', onContentsChange, language }: CodeEditorProps) {
  const editorExtensions = languagesExtensions[language];

  const onCodeChange = useCallback(
    (value: string) => {
      onContentsChange(value);
    },
    [onContentsChange],
  );

  return (
    <ReactCodeMirror
      value={contents}
      onChange={onCodeChange}
      // editor core settings
      editable={true}
      autoFocus={true}
      extensions={editorExtensions}
      basicSetup={editorSettings}
      // visuals settings
      maxHeight="100%"
      theme={editorTheme}
    />
  );
}
