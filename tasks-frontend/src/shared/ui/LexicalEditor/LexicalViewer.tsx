"use client";

import { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $createParagraphNode, $createTextNode } from "lexical";
import { lexicalTheme } from "./theme";
import "./styles.css";

const nodes = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeNode,
  CodeHighlightNode,
];

function LoadContentPlugin({ content }: { content: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!content) return;

    try {
      const parsed = JSON.parse(content);
      const editorState = editor.parseEditorState(parsed);
      editor.setEditorState(editorState);
    } catch {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode(content));
        root.append(paragraph);
      });
    }
  }, [editor, content]);

  return null;
}

interface LexicalViewerProps {
  content: string;
}

export function LexicalViewer({ content }: LexicalViewerProps) {
  return (
    <div className="lexical-viewer">
      <LexicalComposer
        initialConfig={{
          namespace: "TaskViewer",
          theme: lexicalTheme,
          nodes,
          editable: false,
          onError: (error) => console.error("Lexical viewer error:", error),
        }}
      >
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="lexical-content-editable"
              aria-placeholder=""
              placeholder={<span />}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <LoadContentPlugin content={content} />
      </LexicalComposer>
    </div>
  );
}
