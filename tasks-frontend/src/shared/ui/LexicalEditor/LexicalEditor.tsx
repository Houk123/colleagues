"use client";

import { useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode, $createTextNode, type EditorState } from "lexical";
import { lexicalTheme } from "./theme";
import { ToolbarPlugin } from "./ToolbarPlugin";
import "./styles.css";

function InitialValuePlugin({ value }: { value?: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!value) return;

    try {
      const parsed = JSON.parse(value);
      const editorState = editor.parseEditorState(parsed);
      editor.setEditorState(editorState);
    } catch {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(value));
        root.append(paragraph);
      });
    }
  }, [editor, value]);

  return null;
}

const nodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
];

interface LexicalEditorProps {
  value?: string;
  onChange?: (jsonString: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function LexicalEditor({
  value,
  onChange,
  placeholder = "Описание задачи...",
  minHeight = "160px",
}: LexicalEditorProps) {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "TaskEditor",
        theme: lexicalTheme,
        nodes,
        onError: (error) => console.error("Lexical error:", error),
      }}
    >
      <div className="lexical-wrapper" style={{ minHeight }}>
        <ToolbarPlugin />
        <div className="lexical-editor-container">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-content-editable"
                style={{ minHeight }}
                aria-placeholder={placeholder}
                placeholder={<div className="lexical-placeholder">{placeholder}</div>}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <InitialValuePlugin value={value} />
        {onChange && (
          <OnChangePlugin
            onChange={(editorState: EditorState) => {
              onChange(JSON.stringify(editorState.toJSON()));
            }}
          />
        )}
      </div>
    </LexicalComposer>
  );
}
