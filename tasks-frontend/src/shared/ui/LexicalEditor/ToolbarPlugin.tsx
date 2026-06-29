"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import {
  $isHeadingNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode } from "lexical";

const TOOLBAR_STYLES: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "2px",
  padding: "6px 8px",
  borderBottom: "1px solid #e2e8f0",
  background: "#f8fafc",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
};

const BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "28px",
  height: "28px",
  borderRadius: "4px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
};

const BTN_ACTIVE: React.CSSProperties = {
  ...BTN,
  background: "#e0e7ff",
  color: "#3730a3",
};

const SEP: React.CSSProperties = {
  width: "1px",
  height: "20px",
  background: "#e2e8f0",
  margin: "0 4px",
};

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrike(selection.hasFormat("strikethrough"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else {
        setBlockType(element.getType());
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  const formatHeading = (tag: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === tag) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(tag));
        }
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (blockType === "quote") {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  };

  return (
    <div style={TOOLBAR_STYLES}>
      <button
        style={isBold ? BTN_ACTIVE : BTN}
        title="Жирный"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
      >
        B
      </button>
      <button
        style={isItalic ? { ...BTN_ACTIVE, fontStyle: "italic" } : { ...BTN, fontStyle: "italic" }}
        title="Курсив"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
      >
        I
      </button>
      <button
        style={isUnderline ? { ...BTN_ACTIVE, textDecoration: "underline" } : { ...BTN, textDecoration: "underline" }}
        title="Подчёркнутый"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
      >
        U
      </button>
      <button
        style={isStrike ? { ...BTN_ACTIVE, textDecoration: "line-through" } : { ...BTN, textDecoration: "line-through" }}
        title="Зачёркнутый"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
      >
        S
      </button>

      <div style={SEP} />

      <button
        style={blockType === "h1" ? BTN_ACTIVE : BTN}
        title="Заголовок 1"
        onMouseDown={(e) => { e.preventDefault(); formatHeading("h1"); }}
      >
        H1
      </button>
      <button
        style={blockType === "h2" ? BTN_ACTIVE : BTN}
        title="Заголовок 2"
        onMouseDown={(e) => { e.preventDefault(); formatHeading("h2"); }}
      >
        H2
      </button>
      <button
        style={blockType === "h3" ? BTN_ACTIVE : BTN}
        title="Заголовок 3"
        onMouseDown={(e) => { e.preventDefault(); formatHeading("h3"); }}
      >
        H3
      </button>

      <div style={SEP} />

      <button
        style={BTN}
        title="Маркированный список"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }}
      >
        •≡
      </button>
      <button
        style={BTN}
        title="Нумерованный список"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }}
      >
        1≡
      </button>

      <div style={SEP} />

      <button
        style={blockType === "quote" ? BTN_ACTIVE : BTN}
        title="Цитата"
        onMouseDown={(e) => { e.preventDefault(); formatQuote(); }}
      >
        ❝
      </button>
    </div>
  );
}
